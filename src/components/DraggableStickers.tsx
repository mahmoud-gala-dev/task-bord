import React, { useState, useEffect, useRef } from 'react';
import { X, Move, RotateCw, ZoomIn, ZoomOut, Copy, Lock, Unlock } from 'lucide-react';
import { ChalkSticker, FontChoice } from '../types';
import { CHALK_PALETTE } from '../utils/themes';
import { getHandwritingFontClass } from '../utils/fonts';
import { chalkSounds } from '../utils/audio';

interface DraggableStickersProps {
  stickers: ChalkSticker[];
  onAddSticker?: (sticker: ChalkSticker) => void;
  onUpdateSticker: (id: string, updates: Partial<ChalkSticker>) => void;
  onDeleteSticker: (id: string) => void;
  fontChoice: FontChoice;
  zoom: number;
  panX: number;
  panY: number;
}

export const DraggableStickers: React.FC<DraggableStickersProps> = ({
  stickers,
  onAddSticker,
  onUpdateSticker,
  onDeleteSticker,
  fontChoice,
  zoom,
}) => {
  // Deleting sticker IDs for fade-out animation
  const [deletingStickerIds, setDeletingStickerIds] = useState<Set<string>>(new Set());

  // Track if Ctrl key or Alt key is held down for cloning
  const [isCtrlHeld, setIsCtrlHeld] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      setIsCtrlHeld(e.ctrlKey || e.metaKey || e.altKey);
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
    };
  }, []);

  // Dragging state with pointer capture + Ctrl/Alt clone support
  const [dragState, setDragState] = useState<{
    id: string;
    pointerId: number;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    hasMoved: boolean;
    isCloning: boolean;
  } | null>(null);

  const dragRafRef = useRef<number | null>(null);
  const pendingDragPosRef = useRef<{ id: string; x: number; y: number } | null>(null);
  const dragElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      if (dragRafRef.current) cancelAnimationFrame(dragRafRef.current);
    };
  }, []);

  // Rotating state with pointer capture
  const [rotateState, setRotateState] = useState<{
    id: string;
    pointerId: number;
    centerX: number;
    centerY: number;
    startAngle: number;
    initialRotation: number;
  } | null>(null);

  // Duplicate / Clone Sticker
  const handleDuplicateSticker = (sticker: ChalkSticker, offsetX = 25, offsetY = 25) => {
    const cloned: ChalkSticker = {
      ...sticker,
      id: `stk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      x: sticker.x + offsetX,
      y: sticker.y + offsetY,
      locked: false,
      createdAt: Date.now(),
    };
    chalkSounds.playChalkStroke();
    if (onAddSticker) {
      onAddSticker(cloned);
    }
    return cloned;
  };

  // Toggle lock for sticker
  const handleToggleLockSticker = (sticker: ChalkSticker) => {
    chalkSounds.playTap();
    onUpdateSticker(sticker.id, { locked: !sticker.locked });
  };

  // Smooth Fade-out Sticker Deletion Handler
  const handleDeleteStickerWithAnimation = (id: string) => {
    if (deletingStickerIds.has(id)) return;
    chalkSounds.playErase();
    setDeletingStickerIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      onDeleteSticker(id);
      setDeletingStickerIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 380);
  };

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    sticker: ChalkSticker
  ) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-rotate-handle]')) {
      return;
    }

    if (sticker.locked) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const isCtrlClone = e.ctrlKey || e.metaKey || e.altKey;
    let targetStickerId = sticker.id;
    let initialX = sticker.x;
    let initialY = sticker.y;

    if (isCtrlClone && onAddSticker) {
      const cloned = handleDuplicateSticker(sticker, 0, 0);
      targetStickerId = cloned.id;
      initialX = cloned.x;
      initialY = cloned.y;
    }

    const element = e.currentTarget;
    dragElementRef.current = element;
    try {
      element.setPointerCapture(e.pointerId);
    } catch {}

    setDragState({
      id: targetStickerId,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      initialX,
      initialY,
      hasMoved: false,
      isCloning: isCtrlClone,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragState) {
      const deltaX = (e.clientX - dragState.startX) / zoom;
      const deltaY = (e.clientY - dragState.startY) / zoom;
      const hasMoved = dragState.hasMoved || Math.abs(deltaX) > 1.5 || Math.abs(deltaY) > 1.5;

      if (hasMoved) {
        const nextX = Math.round(dragState.initialX + deltaX);
        const nextY = Math.round(dragState.initialY + deltaY);

        if (dragElementRef.current) {
          dragElementRef.current.style.left = `${nextX}px`;
          dragElementRef.current.style.top = `${nextY}px`;
        }

        pendingDragPosRef.current = { id: dragState.id, x: nextX, y: nextY };

        if (!dragRafRef.current) {
          dragRafRef.current = requestAnimationFrame(() => {
            if (pendingDragPosRef.current) {
              onUpdateSticker(pendingDragPosRef.current.id, {
                x: pendingDragPosRef.current.x,
                y: pendingDragPosRef.current.y,
              });
              pendingDragPosRef.current = null;
            }
            dragRafRef.current = null;
          });
        }
      }

      setDragState((prev) => (prev ? { ...prev, hasMoved } : null));
    }

    if (rotateState) {
      const deltaX = e.clientX - rotateState.centerX;
      const deltaY = e.clientY - rotateState.centerY;
      const currentAngleRad = Math.atan2(deltaY, deltaX);
      const currentAngleDeg = (currentAngleRad * 180) / Math.PI;

      let newAngle = Math.round(rotateState.initialRotation + (currentAngleDeg - rotateState.startAngle));
      if (Math.abs(newAngle) < 4) newAngle = 0;

      onUpdateSticker(rotateState.id, {
        rotation: newAngle,
      });
    }
  };

  const handlePointerUp = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (dragRafRef.current) {
      cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = null;
    }
    if (pendingDragPosRef.current && dragState) {
      onUpdateSticker(pendingDragPosRef.current.id, {
        x: pendingDragPosRef.current.x,
        y: pendingDragPosRef.current.y,
      });
      pendingDragPosRef.current = null;
    }
    dragElementRef.current = null;

    if (dragState) {
      try {
        e.currentTarget.releasePointerCapture(dragState.pointerId);
      } catch {}
      chalkSounds.playTap();
      setDragState(null);
    }

    if (rotateState) {
      try {
        e.currentTarget.releasePointerCapture(rotateState.pointerId);
      } catch {}
      chalkSounds.playTap();
      setRotateState(null);
    }
  };

  const handleRotatePointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    sticker: ChalkSticker,
    containerElement: HTMLDivElement | null
  ) => {
    if (sticker.locked) return;
    e.preventDefault();
    e.stopPropagation();

    if (!containerElement) return;
    const rect = containerElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const startAngle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

    try {
      containerElement.setPointerCapture(e.pointerId);
    } catch {}

    setRotateState({
      id: sticker.id,
      pointerId: e.pointerId,
      centerX,
      centerY,
      startAngle,
      initialRotation: sticker.rotation || 0,
    });
  };

  const handleStepRotate = (e: React.MouseEvent, sticker: ChalkSticker) => {
    if (sticker.locked) return;
    e.stopPropagation();
    chalkSounds.playTap();
    const currentRot = sticker.rotation || 0;
    const newRot = (currentRot + 15) % 360;
    onUpdateSticker(sticker.id, { rotation: newRot });
  };

  const handleIncreaseSize = (e: React.MouseEvent, sticker: ChalkSticker) => {
    e.stopPropagation();
    chalkSounds.playTap();
    const currentSize = sticker.size || 54;
    onUpdateSticker(sticker.id, { size: Math.min(140, currentSize + 8) });
  };

  const handleDecreaseSize = (e: React.MouseEvent, sticker: ChalkSticker) => {
    e.stopPropagation();
    chalkSounds.playTap();
    const currentSize = sticker.size || 54;
    onUpdateSticker(sticker.id, { size: Math.max(28, currentSize - 8) });
  };

  const fontClass = getHandwritingFontClass(fontChoice, 'sm');

  return (
    <div className="absolute inset-0 pointer-events-none z-26 overflow-visible">
      {stickers.map((sticker) => {
        const isDraggingThis = dragState?.id === sticker.id;
        const isRotatingThis = rotateState?.id === sticker.id;
        const isDeletingThis = deletingStickerIds.has(sticker.id);
        const chalkInfo = CHALK_PALETTE[sticker.color || 'yellow'] || CHALK_PALETTE.yellow;
        const stickerSize = sticker.size || 54;
        const isLocked = !!sticker.locked;

        return (
          <div
            key={sticker.id}
            data-chalk-sticker="true"
            onPointerDown={(e) => handlePointerDown(e, sticker)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => {
              setDragState(null);
              setRotateState(null);
            }}
            style={{
              left: `${sticker.x}px`,
              top: `${sticker.y}px`,
              transform: `rotate(${sticker.rotation || 0}deg)`,
              transformOrigin: 'center center',
              touchAction: 'none',
            }}
            className={`group absolute pointer-events-auto flex flex-col items-center justify-center p-2 select-none rounded-2xl transition-shadow ${
              isLocked ? 'cursor-default' : 'cursor-grab'
            } ${
              isDeletingThis ? 'chalk-fade-out' : ''
            } ${
              isDraggingThis || isRotatingThis
                ? 'cursor-grabbing opacity-90 scale-105 z-50 ring-2 ring-amber-400 shadow-2xl'
                : 'hover:z-40'
            }`}
          >
            {/* Visual Sticker Badge */}
            <div 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl backdrop-blur-xs transition-transform group-hover:scale-105"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                border: `2px dashed ${chalkInfo.colorHex}`,
                boxShadow: `0 0 12px ${chalkInfo.colorHex}33, 0 4px 12px rgba(0,0,0,0.6)`,
              }}
            >
              {/* Drag / Clone / Lock Handle Icon */}
              {isLocked ? (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleLockSticker(sticker);
                  }}
                  className="p-0.5 text-amber-400 hover:text-amber-300 transition-colors shrink-0 cursor-pointer"
                  title="الستيكر مقفل في مكانه (انقر لفك القفل)"
                >
                  <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              ) : (
                <span 
                  className={`p-0.5 rounded transition-all shrink-0 ${
                    isDraggingThis || isRotatingThis
                      ? 'opacity-100 text-amber-300'
                      : isCtrlHeld
                      ? 'opacity-100 text-amber-400 animate-pulse font-bold'
                      : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto text-white/50 hover:text-white'
                  }`}
                  title={isCtrlHeld ? 'اضغط واسحب للاستنساخ (Ctrl+Drag)' : 'اسحب للتحريك أو اضغط Ctrl للاستنساخ'}
                >
                  {isCtrlHeld ? <Copy className="w-3.5 h-3.5" /> : <Move className="w-3.5 h-3.5" />}
                </span>
              )}

              {/* Emoji Icon */}
              <span 
                className="filter drop-shadow select-none shrink-0"
                style={{ fontSize: `${stickerSize}px` }}
              >
                {sticker.icon}
              </span>

              {/* Sticker Text Label (if any) */}
              {sticker.label && (
                <span 
                  className={`font-bold whitespace-nowrap px-1 leading-none ${fontClass} ${chalkInfo.textClass} ${chalkInfo.glowClass}`}
                  style={{
                    fontSize: `${Math.max(12, Math.round(stickerSize * 0.35))}px`,
                  }}
                >
                  {sticker.label}
                </span>
              )}
            </div>

            {/* Quick Floating Controls on Hover */}
            <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900/90 border border-white/20 px-2 py-0.5 rounded-full shadow-lg pointer-events-auto">
              {/* Lock / Unlock Button */}
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleLockSticker(sticker);
                }}
                title={isLocked ? 'فك قفل الستيكر والسماح بسحبه' : 'قفل الستيكر في مكانه لمنع سحبه بالخطأ'}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  isLocked ? 'text-amber-300' : 'text-white/60 hover:text-amber-300'
                }`}
              >
                {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              </button>

              {/* Duplicate Sticker Button */}
              {onAddSticker && (
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicateSticker(sticker, 20, 20);
                  }}
                  title="تكرار / استنساخ هذا الستيكر (Ctrl+Drag)"
                  className="p-1 text-amber-300 hover:text-white hover:scale-110 transition-transform cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                </button>
              )}

              {/* Zoom In Size */}
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => handleIncreaseSize(e, sticker)}
                title="تكبير حجم الستيكر"
                className="p-1 text-white/70 hover:text-white hover:scale-110 transition-transform cursor-pointer"
              >
                <ZoomIn className="w-3 h-3" />
              </button>

              {/* Zoom Out Size */}
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => handleDecreaseSize(e, sticker)}
                title="تصغير حجم الستيكر"
                className="p-1 text-white/70 hover:text-white hover:scale-110 transition-transform cursor-pointer"
              >
                <ZoomOut className="w-3 h-3" />
              </button>

              {/* Free Rotation Handle */}
              {!isLocked && (
                <button
                  type="button"
                  data-rotate-handle="true"
                  onPointerDown={(e) =>
                    handleRotatePointerDown(
                      e,
                      sticker,
                      e.currentTarget.closest('[data-chalk-sticker]') as HTMLDivElement
                    )
                  }
                  title="اسحب لتدوير الستيكر بأي زاوية حرة"
                  className="p-1 text-amber-300 hover:text-amber-200 transition-colors cursor-alias"
                >
                  <RotateCw className="w-3 h-3" />
                </button>
              )}

              {/* Step Rotate */}
              {!isLocked && (
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => handleStepRotate(e, sticker)}
                  title="تدوير 15 درجة"
                  className="text-[10px] font-mono px-1 text-white/60 hover:text-white cursor-pointer"
                >
                  {sticker.rotation !== 0 ? `${sticker.rotation}°` : 'زاوية'}
                </button>
              )}

              {/* Delete Sticker with Smooth Animation */}
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteStickerWithAnimation(sticker.id);
                }}
                title="حذف هذا الستيكر"
                className="p-1 text-red-400 hover:text-red-200 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
