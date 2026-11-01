import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChalkStroke, ChalkStrokePoint, ChalkColor } from '../types';
import { CHALK_PALETTE } from '../utils/themes';
import { chalkSounds } from '../utils/audio';

interface ChalkDrawingCanvasProps {
  strokes: ChalkStroke[];
  onAddStroke: (stroke: ChalkStroke) => void;
  onUpdateStrokes: (strokes: ChalkStroke[]) => void;
  isDrawingMode: boolean;
  isEraserMode: boolean;
  currentColor: ChalkColor;
  brushSize: number; // e.g. 4, 8, 14, 24
  zoom: number;
  panX: number;
  panY: number;
}

export const ChalkDrawingCanvas: React.FC<ChalkDrawingCanvasProps> = ({
  strokes,
  onAddStroke,
  onUpdateStrokes,
  isDrawingMode,
  isEraserMode,
  currentColor,
  brushSize,
  zoom,
  panX,
  panY,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentStroke, setCurrentStroke] = useState<ChalkStrokePoint[] | null>(null);
  const isPointerDownRef = useRef(false);
  const strokeSoundThrottleRef = useRef<number>(0);

  // Helper to render realistic powdery chalk line between two points
  const drawChalkSegment = useCallback((
    ctx: CanvasRenderingContext2D,
    p1: ChalkStrokePoint,
    p2: ChalkStrokePoint,
    colorHex: string,
    width: number
  ) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.floor(dist / 2));

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Core solid chalk line with slight transparency
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = width;
    ctx.globalAlpha = 0.82;
    ctx.stroke();

    // 2. Soft chalk glow around stroke
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = width * 1.5;
    ctx.globalAlpha = 0.18;
    ctx.stroke();

    // 3. Subtle chalk dust specks / texture along stroke path
    ctx.fillStyle = colorHex;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = p1.x + dx * t;
      const y = p1.y + dy * t;
      
      // Random specks around the stroke
      const speckCount = Math.floor(width / 3.5);
      for (let s = 0; s < speckCount; s++) {
        const offsetRadius = (Math.random() - 0.5) * width * 1.1;
        const angle = Math.random() * Math.PI * 2;
        const speckX = x + Math.cos(angle) * offsetRadius;
        const speckY = y + Math.sin(angle) * offsetRadius;
        const speckSize = 0.8 + Math.random() * 1.4;
        const speckAlpha = 0.15 + Math.random() * 0.35;

        ctx.globalAlpha = speckAlpha;
        ctx.fillRect(speckX, speckY, speckSize, speckSize);
      }
    }

    ctx.restore();
  }, []);

  // Redraw all strokes on canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render saved strokes
    strokes.forEach((stroke) => {
      const pts = stroke.points;
      if (!pts || pts.length === 0) return;
      const colorHex = CHALK_PALETTE[stroke.color]?.colorHex || '#ffffff';

      if (pts.length === 1) {
        // Single point dab
        ctx.save();
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, stroke.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = colorHex;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.restore();
        return;
      }

      for (let i = 0; i < pts.length - 1; i++) {
        drawChalkSegment(ctx, pts[i], pts[i + 1], colorHex, stroke.size);
      }
    });

    // Render current active stroke while drawing
    if (currentStroke && currentStroke.length > 0) {
      const activeColorHex = CHALK_PALETTE[currentColor]?.colorHex || '#ffffff';
      if (currentStroke.length === 1) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(currentStroke[0].x, currentStroke[0].y, brushSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = activeColorHex;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.restore();
      } else {
        for (let i = 0; i < currentStroke.length - 1; i++) {
          drawChalkSegment(ctx, currentStroke[i], currentStroke[i + 1], activeColorHex, brushSize);
        }
      }
    }
  }, [strokes, currentStroke, currentColor, brushSize, drawChalkSegment]);

  // Handle Resize and coordinate scale
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use generous large dimensions to allow scrolling and panning around the board
    const updateSize = () => {
      if (!canvas) return;
      canvas.width = Math.max(3800, window.innerWidth * 3);
      canvas.height = Math.max(3000, window.innerHeight * 3);
      redrawCanvas();
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Convert client pointer coordinate to canvas/board local coordinates
  const clientToBoardCoords = (clientX: number, clientY: number) => {
    return {
      x: (clientX - panX) / zoom,
      y: (clientY - panY) / zoom,
    };
  };

  // Erase strokes intersecting with an eraser radius
  const eraseAtPoint = (x: number, y: number, eraseRadius: number) => {
    const radiusSq = eraseRadius * eraseRadius;
    let hasErased = false;

    const remaining = strokes.filter((stroke) => {
      // Check if any point in stroke is within eraser radius
      const isHit = stroke.points.some((pt) => {
        const distSq = (pt.x - x) ** 2 + (pt.y - y) ** 2;
        return distSq <= radiusSq;
      });

      if (isHit) {
        hasErased = true;
        return false;
      }
      return true;
    });

    if (hasErased) {
      chalkSounds.playErase();
      onUpdateStrokes(remaining);
    }
  };

  // Pointer event handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode && !isEraserMode) return;
    if (e.button !== 0) return; // Only main left button

    const target = e.currentTarget;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {}

    isPointerDownRef.current = true;
    const pt = clientToBoardCoords(e.clientX, e.clientY);

    if (isEraserMode) {
      eraseAtPoint(pt.x, pt.y, brushSize * 1.8);
      return;
    }

    if (isDrawingMode) {
      chalkSounds.playChalkStroke();
      setCurrentStroke([pt]);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    const pt = clientToBoardCoords(e.clientX, e.clientY);

    if (isEraserMode) {
      eraseAtPoint(pt.x, pt.y, brushSize * 1.8);
      return;
    }

    if (isDrawingMode && currentStroke) {
      // Avoid spamming too close points
      const lastPt = currentStroke[currentStroke.length - 1];
      if (lastPt) {
        const dist = Math.hypot(pt.x - lastPt.x, pt.y - lastPt.y);
        if (dist < 2.5) return;
      }

      // Periodic audio feedback during long continuous strokes
      const now = Date.now();
      if (now - strokeSoundThrottleRef.current > 350) {
        chalkSounds.playChalkStroke();
        strokeSoundThrottleRef.current = now;
      }

      setCurrentStroke((prev) => (prev ? [...prev, pt] : [pt]));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    if (isDrawingMode && currentStroke && currentStroke.length > 0) {
      const newStroke: ChalkStroke = {
        id: `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        points: currentStroke,
        color: currentColor,
        size: brushSize,
        createdAt: Date.now(),
      };
      onAddStroke(newStroke);
      setCurrentStroke(null);
    }
  };

  const isActive = isDrawingMode || isEraserMode;

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        left: 0,
        top: 0,
        transformOrigin: '0 0',
        touchAction: isActive ? 'none' : 'auto',
      }}
      className={`absolute inset-0 transition-opacity ${
        isActive ? 'z-50 pointer-events-auto' : 'z-10 pointer-events-none'
      } ${
        isDrawingMode ? 'cursor-crosshair' : isEraserMode ? 'cursor-cell' : ''
      }`}
    />
  );
};
