import React from 'react';
import { ChalkLink, ChalkColor } from '../types';
import { CHALK_PALETTE } from '../utils/themes';
import { X, Trash2 } from 'lucide-react';

interface ChalkArrowsLayerProps {
  links: ChalkLink[];
  taskElements: Map<string, HTMLElement>;
  noteElements: Map<string, HTMLElement>;
  boardContainerRect: DOMRect | null;
  zoom: number;
  panX: number;
  panY: number;
  onDeleteLink: (linkId: string) => void;
  // Connecting in progress (preview line)
  connectingFrom: { type: 'task' | 'note'; id: string } | null;
  cursorBoardPos: { x: number; y: number } | null;
  activeColor: ChalkColor;
}

export const ChalkArrowsLayer: React.FC<ChalkArrowsLayerProps> = ({
  links,
  taskElements,
  noteElements,
  boardContainerRect,
  zoom,
  panX,
  panY,
  onDeleteLink,
  connectingFrom,
  cursorBoardPos,
  activeColor,
}) => {
  if (!boardContainerRect) return null;

  // Convert client rect to local board coordinates (accounting for pan & zoom)
  const getCenterOfElement = (el: HTMLElement | undefined) => {
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const screenX = rect.left + rect.width / 2;
    const screenY = rect.top + rect.height / 2;
    return {
      x: (screenX - panX) / zoom,
      y: (screenY - panY) / zoom,
      left: (rect.left - panX) / zoom,
      right: (rect.right - panX) / zoom,
      top: (rect.top - panY) / zoom,
      bottom: (rect.bottom - panY) / zoom,
      width: rect.width / zoom,
      height: rect.height / zoom,
    };
  };

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible">
      <svg
        className="w-full h-full overflow-visible"
        style={{
          filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.4))',
        }}
      >
        <defs>
          {/* Chalk arrowhead markers for each color */}
          {Object.entries(CHALK_PALETTE).map(([key, info]) => (
            <marker
              key={`arrow-${key}`}
              id={`chalk-arrow-${key}`}
              viewBox="0 0 12 12"
              refX="8"
              refY="6"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path
                d="M 0 2 L 10 6 L 0 10 z"
                fill={info.colorHex}
                stroke={info.colorHex}
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </marker>
          ))}
        </defs>

        {/* Render all established links between Tasks and Notes */}
        {links.map((link) => {
          const taskEl = taskElements.get(link.taskId);
          const noteEl = noteElements.get(link.noteId);
          if (!taskEl || !noteEl) return null;

          const tBox = getCenterOfElement(taskEl);
          const nBox = getCenterOfElement(noteEl);
          if (!tBox || !nBox) return null;

          // Choose edge anchor points based on relative positions
          const isNoteToLeft = nBox.x < tBox.x;
          const startX = isNoteToLeft ? tBox.left : tBox.right;
          const startY = tBox.y;

          const endX = isNoteToLeft ? nBox.right : nBox.left;
          const endY = nBox.y;

          // Curved chalk path with natural organic arc
          const dx = endX - startX;
          const dy = endY - startY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const curvature = Math.min(50, Math.max(20, dist * 0.2));
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2 - curvature;

          const pathData = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
          const chalkInfo = CHALK_PALETTE[link.color || 'yellow'] || CHALK_PALETTE.yellow;

          return (
            <g key={link.id} className="group pointer-events-auto cursor-pointer">
              {/* Very generous transparent hit area for easy clicking & hovering anywhere on the arrow */}
              <path
                d={pathData}
                fill="none"
                stroke="transparent"
                strokeWidth="36"
                className="cursor-pointer pointer-events-auto"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDeleteLink(link.id);
                }}
              />

              {/* Glowing chalk stroke */}
              <path
                d={pathData}
                fill="none"
                stroke={chalkInfo.colorHex}
                strokeWidth="2.5"
                strokeDasharray="6 3"
                strokeLinecap="round"
                markerEnd={`url(#chalk-arrow-${link.color || 'yellow'})`}
                className="transition-all opacity-85 group-hover:opacity-100 group-hover:stroke-[3.5]"
              />
            </g>
          );
        })}

        {/* Render interactive Preview Arrow while dragging / creating a link */}
        {connectingFrom && cursorBoardPos && (
          (() => {
            let sourceEl: HTMLElement | undefined;
            if (connectingFrom.type === 'task') {
              sourceEl = taskElements.get(connectingFrom.id);
            } else {
              sourceEl = noteElements.get(connectingFrom.id);
            }

            const box = getCenterOfElement(sourceEl);
            if (!box) return null;

            const startX = box.x;
            const startY = box.y;
            const endX = cursorBoardPos.x;
            const endY = cursorBoardPos.y;

            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2 - 25;
            const pathData = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
            const activeChalk = CHALK_PALETTE[activeColor] || CHALK_PALETTE.yellow;

            return (
              <g className="pointer-events-none">
                <path
                  d={pathData}
                  fill="none"
                  stroke={activeChalk.colorHex}
                  strokeWidth="2.5"
                  strokeDasharray="5 4"
                  strokeLinecap="round"
                  markerEnd={`url(#chalk-arrow-${activeColor})`}
                  className="animate-pulse opacity-90"
                />
                <circle
                  cx={endX}
                  cy={endY}
                  r="5"
                  fill={activeChalk.colorHex}
                  className="animate-ping"
                />
              </g>
            );
          })()
        )}
      </svg>

      {/* HTML interactive overlay for delete handles (High z-index, reliable pointer events) */}
      {links.map((link) => {
        const taskEl = taskElements.get(link.taskId);
        const noteEl = noteElements.get(link.noteId);
        if (!taskEl || !noteEl) return null;

        const tBox = getCenterOfElement(taskEl);
        const nBox = getCenterOfElement(noteEl);
        if (!tBox || !nBox) return null;

        const isNoteToLeft = nBox.x < tBox.x;
        const startX = isNoteToLeft ? tBox.left : tBox.right;
        const startY = tBox.y;
        const endX = isNoteToLeft ? nBox.right : nBox.left;
        const endY = nBox.y;

        const dx = endX - startX;
        const dy = endY - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const curvature = Math.min(50, Math.max(20, dist * 0.2));
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2 - curvature;

        return (
          <div
            key={`btn-${link.id}`}
            style={{
              left: `${midX - 16}px`,
              top: `${midY - 16}px`,
            }}
            className="absolute z-50 pointer-events-auto flex items-center justify-center"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteLink(link.id);
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteLink(link.id);
              }}
              title="حذف هذا السهم فوراً"
              className="w-8 h-8 rounded-full bg-neutral-950/90 hover:bg-red-600 text-white border-2 border-white/70 hover:border-red-300 flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.8)] transition-all hover:scale-125 cursor-pointer active:scale-95"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
