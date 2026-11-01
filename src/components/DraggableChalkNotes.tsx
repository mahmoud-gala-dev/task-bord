import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Move, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Share2, 
  Smile, 
  Copy, 
  Lock, 
  Unlock, 
  Edit3, 
  Palette, 
  Layers, 
  Check 
} from 'lucide-react';
import { FreeChalkText, ChalkColor, FontChoice } from '../types';
import { CHALK_PALETTE } from '../utils/themes';
import { chalkSounds } from '../utils/audio';
import { IconPickerPopover } from './IconPickerPopover';

interface DraggableChalkNotesProps {
  notes: FreeChalkText[];
  onAddNote: (note: FreeChalkText) => void;
  onUpdateNote: (id: string, updates: Partial<FreeChalkText>) => void;
  onDeleteNote: (id: string) => void;
  currentColor: ChalkColor;
  fontChoice: FontChoice;
  zoom: number;
  panX: number;
  panY: number;
  selectedNoteId?: string | null;
  onSelectNote?: (id: string | null) => void;
  // Connecting arrow links
  onStartConnect?: (noteId: string) => void;
  onSelectConnectTarget?: (noteId: string) => void;
  isConnectingFromThis?: (noteId: string) => boolean;
  isConnectingActive?: boolean;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const DraggableChalkNotes: React.FC<DraggableChalkNotesProps> = ({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  currentColor,
  fontChoice,
  zoom,
  panX,
  panY,
  selectedNoteId,
  onSelectNote,
  onStartConnect,
  onSelectConnectTarget,
  isConnectingFromThis,
  isConnectingActive,
  onContextMenu,
}) => {
  // Note selection state (synced with parent or locally)
  const [internalSelectedNoteId, setInternalSelectedNoteId] = useState<string | null>(null);
  const activeSelectedId = selectedNoteId !== undefined ? selectedNoteId : internalSelectedNoteId;
  const setSelectedNoteId = (id: string | null) => {
    setInternalSelectedNoteId(id);
    if (onSelectNote) onSelectNote(id);
  };

  // Direct typing cursor position on canvas coordinates (accounting for pan & zoom)
  const [activeCursorPos, setActiveCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [directText, setDirectText] = useState('');
  const directTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Deleting notes fade-out animation state
  const [deletingNoteIds, setDeletingNoteIds] = useState<Set<string>>(new Set());

  // Icon picker state for a specific note
  const [activeIconNoteId, setActiveIconNoteId] = useState<string | null>(null);

  // Color picker popover state for note
  const [activeColorNoteId, setActiveColorNoteId] = useState<string | null>(null);

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
    clonedNoteId: string | null;
  } | null>(null);

  // High-performance RAF ref for ultra-responsive drag-and-drop
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

  // Direct editing of an existing note
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Track if Ctrl key or Alt key is held down
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

  // Keyboard shortcuts when a note is selected (Delete, Escape, Enter to edit, Ctrl+D, Arrow keys nudge)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (activeSelectedId) {
        const note = notes.find((n) => n.id === activeSelectedId);
        if (!note) return;

        if (e.key === 'Escape') {
          setSelectedNoteId(null);
          return;
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          handleDeleteNoteWithAnimation(activeSelectedId);
          setSelectedNoteId(null);
          return;
        }

        if (e.key === 'Enter') {
          e.preventDefault();
          chalkSounds.playTap();
          setEditingId(activeSelectedId);
          setEditingText(note.text);
          return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
          e.preventDefault();
          const cloned = handleDuplicateNote(note, 25, 25);
          setSelectedNoteId(cloned.id);
          return;
        }

        // Arrow keys to nudge note position
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          if (note.locked) return;
          e.preventDefault();
          const step = e.shiftKey ? 16 : 4;
          let deltaX = 0;
          let deltaY = 0;
          if (e.key === 'ArrowUp') deltaY = -step;
          if (e.key === 'ArrowDown') deltaY = step;
          if (e.key === 'ArrowLeft') deltaX = -step;
          if (e.key === 'ArrowRight') deltaX = step;
          onUpdateNote(note.id, {
            x: Math.round(note.x + deltaX),
            y: Math.round(note.y + deltaY),
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSelectedId, notes]);

  // Auto-focus input when direct cursor position is set
  useEffect(() => {
    if (activeCursorPos && directTextareaRef.current) {
      directTextareaRef.current.focus();
      directTextareaRef.current.style.height = 'auto';
      directTextareaRef.current.style.height = `${directTextareaRef.current.scrollHeight}px`;
    }
  }, [activeCursorPos]);

  // Auto-focus input when editing an existing note
  useEffect(() => {
    if (editingId && editTextareaRef.current) {
      editTextareaRef.current.focus();
      editTextareaRef.current.select();
      editTextareaRef.current.style.height = 'auto';
      editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`;
    }
  }, [editingId]);

  // Convert screen coordinates to workspace board coordinates
  const screenToBoard = (screenX: number, screenY: number) => {
    return {
      x: (screenX - panX) / zoom,
      y: (screenY - panY) / zoom,
    };
  };

  // Finish direct typing on blackboard (commit note)
  const commitDirectText = () => {
    const trimmed = directText.trim();
    if (trimmed && activeCursorPos) {
      const newNote: FreeChalkText = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        text: trimmed,
        x: activeCursorPos.x,
        y: activeCursorPos.y,
        color: currentColor,
        fontSize: 32,
        rotation: 0,
        createdAt: Date.now(),
      };
      chalkSounds.playChalkStroke();
      onAddNote(newNote);
    }
    setActiveCursorPos(null);
    setDirectText('');
  };

  // Save edit of existing note (ensures position stays fixed and does not jump)
  const commitEdit = (id: string) => {
    const trimmed = editingText.trim();
    if (trimmed) {
      onUpdateNote(id, { text: trimmed });
      chalkSounds.playChalkStroke();
    }
    setEditingId(null);
  };

  // Clone/Duplicate a note
  const handleDuplicateNote = (note: FreeChalkText, offsetX = 30, offsetY = 30) => {
    const cloned: FreeChalkText = {
      ...note,
      id: crypto.randomUUID ? crypto.randomUUID() : `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      x: note.x + offsetX,
      y: note.y + offsetY,
      locked: false,
      createdAt: Date.now(),
    };
    chalkSounds.playChalkStroke();
    onAddNote(cloned);
    return cloned;
  };

  // Toggle lock status for a note
  const handleToggleLockNote = (note: FreeChalkText) => {
    chalkSounds.playTap();
    onUpdateNote(note.id, { locked: !note.locked });
  };

  // Smooth Fade-out Note Deletion Handler
  const handleDeleteNoteWithAnimation = (id: string) => {
    if (deletingNoteIds.has(id)) return;
    chalkSounds.playErase();
    setDeletingNoteIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      onDeleteNote(id);
      setDeletingNoteIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 380);
  };

  // Font size handlers (+ / -)
  const handleIncreaseFontSize = (e: React.MouseEvent, note: FreeChalkText) => {
    e.stopPropagation();
    chalkSounds.playTap();
    const currentSize = note.fontSize || 32;
    const nextSize = Math.min(100, currentSize + 4);
    onUpdateNote(note.id, { fontSize: nextSize });
  };

  const handleDecreaseFontSize = (e: React.MouseEvent, note: FreeChalkText) => {
    e.stopPropagation();
    chalkSounds.playTap();
    const currentSize = note.fontSize || 32;
    const nextSize = Math.max(14, currentSize - 4);
    onUpdateNote(note.id, { fontSize: nextSize });
  };

  // Clicking anywhere on the chalkboard opens typing cursor at board coordinate
  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Don't trigger if clicked on existing note, sticker, tasks list, buttons or inputs
    if (
      target.closest('[data-chalk-note]') ||
      target.closest('[data-chalk-sticker]') ||
      target.closest('[data-task-id]') ||
      target.closest('main') ||
      target.closest('header') ||
      target.closest('footer') ||
      target.closest('[data-workspace-controls]') ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.closest('button')
    ) {
      return;
    }

    // Deselect note and close any open popovers
    setSelectedNoteId(null);
    setActiveColorNoteId(null);
    setActiveIconNoteId(null);

    if (directText.trim()) {
      commitDirectText();
    }

    const boardPos = screenToBoard(e.clientX, e.clientY);
    setActiveCursorPos({ x: boardPos.x, y: boardPos.y });
    chalkSounds.playTap();
  };

  // Pointer drag start for notes (with Lock and Ctrl/Alt + Drag clone detection!)
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    note: FreeChalkText
  ) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('button') || target.closest('[data-rotate-handle]')) {
      return;
    }

    // If arrow connecting is currently active, clicking this note links it immediately!
    if (isConnectingActive && onSelectConnectTarget) {
      e.preventDefault();
      e.stopPropagation();
      onSelectConnectTarget(note.id);
      return;
    }

    // If note is locked, disallow dragging but still select it!
    if (note.locked) {
      setSelectedNoteId(note.id);
      chalkSounds.playTap();
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const isCtrlClone = e.ctrlKey || e.metaKey || e.altKey;
    let targetNoteId = note.id;
    let initialX = note.x;
    let initialY = note.y;

    // If Ctrl is held down when starting drag, create a clone immediately at the same spot and drag the clone!
    if (isCtrlClone) {
      const cloned = handleDuplicateNote(note, 0, 0);
      targetNoteId = cloned.id;
      initialX = cloned.x;
      initialY = cloned.y;
    }

    // Select this note immediately
    setSelectedNoteId(targetNoteId);

    const element = e.currentTarget;
    dragElementRef.current = element;
    try {
      element.setPointerCapture(e.pointerId);
    } catch {}

    setDragState({
      id: targetNoteId,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      initialX,
      initialY,
      hasMoved: false,
      isCloning: isCtrlClone,
      clonedNoteId: isCtrlClone ? targetNoteId : null,
    });
  };

  // Pointer drag move (hardware-accelerated zero-latency 120fps+ tracking)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragState) {
      const deltaX = (e.clientX - dragState.startX) / zoom;
      const deltaY = (e.clientY - dragState.startY) / zoom;

      if (!dragState.hasMoved && (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1)) {
        dragState.hasMoved = true;
        setDragState((prev) => (prev ? { ...prev, hasMoved: true } : null));
      }

      if (dragState.hasMoved) {
        const nextX = Math.round(dragState.initialX + deltaX);
        const nextY = Math.round(dragState.initialY + deltaY);

        // Instant synchronous direct DOM update for 0ms lag-free dragging
        if (dragElementRef.current) {
          dragElementRef.current.style.left = `${nextX}px`;
          dragElementRef.current.style.top = `${nextY}px`;
        }

        pendingDragPosRef.current = { id: dragState.id, x: nextX, y: nextY };

        if (!dragRafRef.current) {
          dragRafRef.current = requestAnimationFrame(() => {
            if (pendingDragPosRef.current) {
              onUpdateNote(pendingDragPosRef.current.id, {
                x: pendingDragPosRef.current.x,
                y: pendingDragPosRef.current.y,
              });
              pendingDragPosRef.current = null;
            }
            dragRafRef.current = null;
          });
        }
      }
    }

    if (rotateState) {
      const deltaX = e.clientX - rotateState.centerX;
      const deltaY = e.clientY - rotateState.centerY;
      const currentAngleRad = Math.atan2(deltaY, deltaX);
      const currentAngleDeg = (currentAngleRad * 180) / Math.PI;

      let newAngle = Math.round(rotateState.initialRotation + (currentAngleDeg - rotateState.startAngle));
      if (Math.abs(newAngle) < 4) newAngle = 0;

      onUpdateNote(rotateState.id, {
        rotation: newAngle,
      });
    }
  };

  // Pointer drag release
  const handlePointerUp = (
    e: React.PointerEvent<HTMLDivElement>,
    note: FreeChalkText
  ) => {
    if (dragRafRef.current) {
      cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = null;
    }
    if (pendingDragPosRef.current && dragState) {
      onUpdateNote(pendingDragPosRef.current.id, {
        x: pendingDragPosRef.current.x,
        y: pendingDragPosRef.current.y,
      });
      pendingDragPosRef.current = null;
    }

    if (dragState) {
      try {
        e.currentTarget.releasePointerCapture(dragState.pointerId);
      } catch {}

      if (!dragState.hasMoved && !dragState.isCloning) {
        if (isConnectingActive && onSelectConnectTarget) {
          onSelectConnectTarget(note.id);
        } else {
          // Select note cleanly without abruptly opening raw textarea
          setSelectedNoteId(note.id);
          chalkSounds.playTap();
        }
      } else {
        chalkSounds.playTap();
      }
      dragElementRef.current = null;
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

  // Start rotation handle
  const handleRotatePointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    note: FreeChalkText,
    containerElement: HTMLDivElement | null
  ) => {
    if (note.locked) return;
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
      id: note.id,
      pointerId: e.pointerId,
      centerX,
      centerY,
      startAngle,
      initialRotation: note.rotation || 0,
    });
  };

  // Step rotate 15 degrees
  const handleStepRotate = (e: React.MouseEvent, note: FreeChalkText) => {
    if (note.locked) return;
    e.stopPropagation();
    chalkSounds.playTap();
    const currentRot = note.rotation || 0;
    const newRot = (currentRot + 15) % 360;
    onUpdateNote(note.id, { rotation: newRot });
  };

  const getFontFamilyClass = () => {
    switch (fontChoice) {
      case 'aref':
        return 'font-handwriting-ruqaa font-bold';
      case 'katibeh':
        return 'font-handwriting-katibeh font-normal';
      case 'rakkas':
        return 'font-handwriting-rakkas font-normal';
      case 'lateef':
        return 'font-handwriting-lateef font-bold';
      case 'amiri':
        return 'font-handwriting-amiri font-bold';
      case 'chalk':
        return 'font-handwriting-chalk font-normal';
      case 'kufi':
        return 'font-handwriting-kufi font-semibold';
      case 'modern':
      default:
        return 'font-modern font-semibold';
    }
  };

  const fontClass = getFontFamilyClass();
  const currentChalkInfo = CHALK_PALETTE[currentColor] || CHALK_PALETTE.white;

  return (
    <>
      {/* Background board surface for typing on empty chalkboard and deselecting (z-12, under tasks z-20 and under notes z-28) */}
      <div
        onClick={handleBoardClick}
        onContextMenu={onContextMenu}
        className="absolute inset-0 z-12 pointer-events-auto cursor-text"
        title="انقر في أي مساحة بالعمل للكتابة بالطبشور مباشرة أو انقر بالزر الأيمن لقائمة السياق"
      />

      {/* DIRECT IN-PLACE CHALK TYPING (MULTILINE SUPPORT) */}
      {activeCursorPos && (
        <div
          style={{
            left: `${activeCursorPos.x}px`,
            top: `${activeCursorPos.y}px`,
          }}
          className="absolute z-50 flex items-center pointer-events-auto bg-black/40 backdrop-blur-xs p-2 rounded-xl border border-white/20 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <textarea
            ref={directTextareaRef}
            rows={1}
            value={directText}
            onChange={(e) => {
              setDirectText(e.target.value);
              chalkSounds.playTap();
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onBlur={commitDirectText}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                commitDirectText();
              }
              if (e.key === 'Escape') {
                setActiveCursorPos(null);
                setDirectText('');
              }
            }}
            placeholder="اكتب بالطبشور هنا مباشرة (Shift+Enter لسطر جديد)..."
            style={{
              fontSize: '32px',
              caretColor: currentChalkInfo.colorHex,
              minWidth: '260px',
            }}
            className={`bg-transparent border-none outline-none leading-relaxed select-text transition-colors p-0 m-0 resize-none ${fontClass} ${currentChalkInfo.textClass} ${currentChalkInfo.glowClass} placeholder:text-white/40`}
            maxLength={400}
          />
        </div>
      )}

      {/* RENDER ALL DRAGGABLE, RESIZABLE, CLONABLE & ROTATABLE FREE CHALK NOTES (z-28: Above tasks) */}
      <div className="absolute inset-0 pointer-events-none z-28 overflow-visible">
        {notes.map((note) => {
          const chalkInfo = CHALK_PALETTE[note.color] || CHALK_PALETTE.white;
          const isDraggingThis = dragState?.id === note.id;
          const isRotatingThis = rotateState?.id === note.id;
          const isEditingThis = editingId === note.id;
          const isDeletingThis = deletingNoteIds.has(note.id);
          const isSelected = activeSelectedId === note.id;
          const rotationAngle = note.rotation || 0;
          const noteFontSize = note.fontSize || 32;
          const isConnecting = isConnectingFromThis ? isConnectingFromThis(note.id) : false;
          const isLocked = !!note.locked;
          const isBackLayer = note.layer === 'back';

          // Z-index hierarchy:
          // - Dragging or rotating: z-50
          // - Selected or editing: z-45
          // - Hovered: elevates to z-40
          // - Back layer: z-15
          // - Default: z-28 (above tasks z-20)
          const zIndexClass = isDraggingThis || isRotatingThis
            ? 'z-50'
            : isSelected || isEditingThis
            ? 'z-45'
            : isBackLayer
            ? 'z-15 hover:z-40'
            : 'z-28 hover:z-40';

          return (
            <div
              key={note.id}
              data-chalk-note="true"
              data-note-id={note.id}
              onPointerDown={(e) => handlePointerDown(e, note)}
              onPointerMove={handlePointerMove}
              onPointerUp={(e) => handlePointerUp(e, note)}
              onPointerCancel={() => {
                dragElementRef.current = null;
                setDragState(null);
                setRotateState(null);
              }}
              style={{
                left: `${note.x}px`,
                top: `${note.y}px`,
                transform: `rotate(${rotationAngle}deg)`,
                transformOrigin: 'top right',
                touchAction: 'none',
                willChange: isDraggingThis ? 'left, top' : undefined,
              }}
              className={`group absolute pointer-events-auto flex items-start gap-1.5 p-1.5 select-none rounded-xl ${zIndexClass} ${
                isDraggingThis
                  ? '!transition-none cursor-grabbing opacity-95 scale-[1.03] ring-2 ring-amber-400/80 shadow-2xl bg-black/60 backdrop-blur-xs'
                  : 'transition-[box-shadow,border-color,background-color,opacity] duration-150 ' + (
                      isRotatingThis
                        ? 'cursor-grabbing opacity-90 scale-105 ring-2 ring-amber-400/80 shadow-2xl bg-black/50 backdrop-blur-xs'
                        : isSelected
                        ? 'ring-2 ring-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)] bg-black/50 backdrop-blur-xs scale-[1.01]'
                        : isLocked
                        ? 'cursor-default hover:bg-white/[0.04]'
                        : 'cursor-grab hover:bg-white/[0.05] hover:backdrop-blur-xs hover:border hover:border-white/10'
                    )
              } ${
                isDeletingThis ? 'chalk-fade-out' : ''
              } ${
                isConnectingActive
                  ? 'ring-2 ring-amber-400 bg-amber-400/10 hover:ring-amber-300 hover:scale-105 cursor-pointer shadow-lg'
                  : ''
              } ${
                isConnecting ? 'ring-2 ring-amber-400 bg-amber-400/20' : ''
              }`}
            >
              {/* Selected badge */}
              {isSelected && !isEditingThis && (
                <span className="absolute -top-3.5 right-2 px-1.5 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-bold shadow-md flex items-center gap-0.5 pointer-events-none select-none animate-in fade-in">
                  محددة
                </span>
              )}

              {/* Move / Clone / Lock Handle icon */}
              {!isEditingThis && (
                isLocked ? (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleLockNote(note);
                    }}
                    className={`p-1 rounded-md text-amber-400/90 hover:text-amber-300 transition-all shrink-0 cursor-pointer mt-1 bg-amber-400/10 ${
                      isSelected
                        ? 'opacity-100'
                        : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
                    }`}
                    title="الملاحظة مقفلة في مكانها لمنع سحبها بالخطأ (انقر لفك القفل)"
                  >
                    <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                ) : (
                  <span
                    className={`p-1 rounded-md transition-all shrink-0 cursor-grab mt-1 ${
                      isSelected
                        ? isCtrlHeld
                          ? 'opacity-100 bg-amber-400 text-black font-bold animate-pulse'
                          : 'opacity-100 text-amber-300 bg-white/10'
                        : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto text-white/50 hover:text-white hover:bg-white/10'
                    }`}
                    title={isCtrlHeld ? 'اضغط واسحب لعمل نسخة مكررة فوراً (Ctrl+Drag)' : 'انقر واسحب للتحريك في أي مساحة وزاوية (أو اضغط Ctrl لعمل نسخة)'}
                  >
                    {isCtrlHeld ? <Copy className="w-3.5 h-3.5 stroke-[2.5]" /> : <Move className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </span>
                )
              )}

              {/* Note Icon (if set) */}
              {note.icon && (
                <span 
                  className="cursor-pointer hover:scale-125 transition-transform shrink-0 mt-0.5"
                  style={{ fontSize: `${Math.max(20, noteFontSize - 4)}px` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIconNoteId(note.id);
                  }}
                  title="تغيير الأيقونة"
                >
                  {note.icon}
                </span>
              )}

              {/* Note text OR direct inline edit with zero jump / identical layout */}
              <div className="relative min-w-[60px] flex items-center">
                {isEditingThis ? (
                  <textarea
                    ref={editTextareaRef}
                    rows={1}
                    value={editingText}
                    onChange={(e) => {
                      setEditingText(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onBlur={() => commitEdit(note.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        commitEdit(note.id);
                      }
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      fontSize: `${noteFontSize}px`,
                      caretColor: chalkInfo.colorHex,
                      minWidth: '160px',
                      padding: 0,
                      margin: 0,
                      boxSizing: 'border-box',
                    }}
                    className={`bg-transparent border-b-2 border-amber-400/80 outline-none leading-relaxed resize-none ${fontClass} ${chalkInfo.textClass} ${chalkInfo.glowClass}`}
                    maxLength={400}
                  />
                ) : (
                  <span
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingId(note.id);
                      setEditingText(note.text);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isConnectingActive && onSelectConnectTarget) {
                        onSelectConnectTarget(note.id);
                        return;
                      }
                      setSelectedNoteId(note.id);
                      chalkSounds.playTap();
                    }}
                    style={{
                      fontSize: `${noteFontSize}px`,
                      padding: 0,
                      margin: 0,
                      boxSizing: 'border-box',
                    }}
                    className={`leading-relaxed select-none tracking-wide transition-all cursor-pointer whitespace-pre-wrap break-words border-b-2 border-transparent ${fontClass} ${chalkInfo.textClass} ${chalkInfo.glowClass}`}
                    title={
                      isConnectingActive 
                        ? 'انقر لتوصيل السهم مع هذه الملاحظة' 
                        : isLocked 
                        ? 'ملاحظة مقفلة (انقر للتحديد، نقر مزدوج للتعديل)' 
                        : 'انقر للتحديد، نقر مزدوج للتعديل المباشر، أو اسحب للتحريك'
                    }
                  >
                    {note.text}
                  </span>
                )}
              </div>

              {/* Icon Picker Popover for Note */}
              {activeIconNoteId === note.id && (
                <div className="absolute top-10 right-0 z-50">
                  <IconPickerPopover
                    currentIcon={note.icon}
                    onSelectIcon={(icon) => {
                      onUpdateNote(note.id, { icon });
                      setActiveIconNoteId(null);
                    }}
                    onRemoveIcon={() => {
                      onUpdateNote(note.id, { icon: undefined });
                      setActiveIconNoteId(null);
                    }}
                    onClose={() => setActiveIconNoteId(null)}
                    title="أيقونة الملاحظة"
                  />
                </div>
              )}

              {/* Controls appearing when selected OR on hover */}
              {!isEditingThis && (
                <div
                  className={`flex items-center gap-0.5 transition-opacity shrink-0 mt-0.5 bg-black/75 backdrop-blur-md p-1 rounded-xl border border-white/15 shadow-xl ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Edit Text Button */}
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      chalkSounds.playTap();
                      setEditingId(note.id);
                      setEditingText(note.text);
                    }}
                    title="تعديل نص الملاحظة (أو انقر نقراً مزدوجاً)"
                    className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Quick Chalk Color Selector button */}
                  <div className="relative">
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        chalkSounds.playTap();
                        setActiveColorNoteId(activeColorNoteId === note.id ? null : note.id);
                      }}
                      title="تغيير لون الطبشور"
                      className="p-1 text-white/70 hover:text-amber-300 hover:bg-white/10 rounded transition-colors cursor-pointer flex items-center justify-center"
                    >
                      <span 
                        className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs" 
                        style={{ backgroundColor: chalkInfo.colorHex }}
                      />
                    </button>
                    {activeColorNoteId === note.id && (
                      <div 
                        className="absolute bottom-full mb-2 right-0 z-50 flex items-center gap-1.5 p-1.5 bg-neutral-900/95 border border-white/20 rounded-xl shadow-2xl backdrop-blur-md"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        {(['white', 'yellow', 'cyan', 'pink', 'mint', 'peach', 'lavender'] as ChalkColor[]).map((c) => {
                          const info = CHALK_PALETTE[c] || CHALK_PALETTE.white;
                          const isCurrent = (note.color || 'white') === c;
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                chalkSounds.playChalkStroke();
                                onUpdateNote(note.id, { color: c });
                                setActiveColorNoteId(null);
                              }}
                              title={info.name}
                              className={`w-5 h-5 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                                isCurrent ? 'ring-2 ring-white scale-110' : 'hover:scale-110'
                              }`}
                              style={{ backgroundColor: info.colorHex, borderColor: 'rgba(255,255,255,0.4)' }}
                            >
                              {isCurrent && <Check className="w-3 h-3 text-black stroke-[3]" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Layer Front/Back toggle (Bring in front of tasks / Send behind tasks) */}
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      chalkSounds.playTap();
                      const nextLayer = note.layer === 'back' ? 'front' : 'back';
                      onUpdateNote(note.id, { layer: nextLayer });
                    }}
                    title={note.layer === 'back' ? 'إحضار الملاحظة للأمام (فوق المهام)' : 'إرسال الملاحظة للخلف (تحت المهام)'}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      note.layer === 'back' 
                        ? 'text-white/40 hover:text-white hover:bg-white/10' 
                        : 'text-amber-300 bg-amber-400/15 hover:bg-amber-400/25'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </button>

                  {/* Lock / Unlock Toggle Button */}
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleLockNote(note);
                    }}
                    title={isLocked ? 'فك قفل الملاحظة والسماح بتحريكها' : 'قفل الملاحظة في مكانها لمنع سحبها بالخطأ'}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      isLocked
                        ? 'text-amber-300 bg-amber-400/20'
                        : 'text-white/50 hover:text-amber-300 hover:bg-white/10'
                    }`}
                  >
                    {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>

                  {/* Duplicate Note button (PowerPoint style clone) */}
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      const cloned = handleDuplicateNote(note, 25, 25);
                      setSelectedNoteId(cloned.id);
                    }}
                    title="تكرار / استنساخ هذه الملاحظة (Ctrl+Drag)"
                    className="p-1 text-amber-300 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Arrow Connector button */}
                  {onStartConnect && (
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        chalkSounds.playTap();
                        onStartConnect(note.id);
                      }}
                      title="رسم سهم ووصلة مع مهمة"
                      className="p-1 text-cyan-300 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Add/Change Icon button */}
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIconNoteId(note.id);
                    }}
                    title="إضافة أو تغيير أيقونة"
                    className="p-1 text-white/50 hover:text-amber-300 hover:bg-white/10 rounded transition-colors cursor-pointer"
                  >
                    <Smile className="w-3.5 h-3.5" />
                  </button>

                  {/* Increase Font Size */}
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => handleIncreaseFontSize(e, note)}
                    title="تكبير حجم الخط (A+)"
                    className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>

                  {/* Decrease Font Size */}
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => handleDecreaseFontSize(e, note)}
                    title="تصغير حجم الخط (A-)"
                    className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>

                  {/* Free continuous rotation handle */}
                  {!isLocked && (
                    <button
                      type="button"
                      data-rotate-handle="true"
                      onPointerDown={(e) =>
                        handleRotatePointerDown(e, note, e.currentTarget.closest('[data-chalk-note]') as HTMLDivElement)
                      }
                      title="اسحب لتدوير الكتابة بأي زاوية حرة"
                      className="p-1 text-amber-300/70 hover:text-amber-300 transition-colors cursor-alias"
                    >
                      <RotateCw className="w-3 h-3" />
                    </button>
                  )}

                  {/* Step rotation shortcut */}
                  {!isLocked && (
                    <button
                      type="button"
                      onClick={(e) => handleStepRotate(e, note)}
                      title={`تدوير بزاوية (${rotationAngle}°)`}
                      className="text-[10px] font-mono px-1 py-0.5 rounded text-white/60 hover:text-white transition-colors cursor-pointer"
                    >
                      {rotationAngle !== 0 ? `${rotationAngle}°` : 'زاوية'}
                    </button>
                  )}

                  {/* Delete button with smooth animation */}
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNoteWithAnimation(note.id);
                    }}
                    title="مسح الكتابة"
                    className="p-1 text-red-300/50 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
