import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Pencil, Check, Sparkles } from 'lucide-react';
import { BoardTab } from '../types';
import { chalkSounds } from '../utils/audio';

interface BoardsBarProps {
  boards: BoardTab[];
  activeBoardId: string;
  onSelectBoard: (id: string) => void;
  onCreateBoard: (title: string) => void;
  onRenameBoard: (id: string, newTitle: string) => void;
  onDeleteBoard: (id: string) => void;
}

export const BoardsBar: React.FC<BoardsBarProps> = ({
  boards,
  activeBoardId,
  onSelectBoard,
  onCreateBoard,
  onRenameBoard,
  onDeleteBoard,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const createInputRef = useRef<HTMLInputElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating) createInputRef.current?.focus();
  }, [isCreating]);

  useEffect(() => {
    if (editingId) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editingId]);

  const handleFinishCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (trimmed) {
      chalkSounds.playChalkStroke();
      onCreateBoard(trimmed);
      setNewTitle('');
    }
    setIsCreating(false);
  };

  const handleFinishRename = (id: string) => {
    const trimmed = editingTitle.trim();
    if (trimmed) {
      chalkSounds.playChalkStroke();
      onRenameBoard(id, trimmed);
    }
    setEditingId(null);
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar select-none">
      {boards.map((b, idx) => {
        const isActive = b.id === activeBoardId;
        const isEditingThis = editingId === b.id;

        return (
          <div
            key={b.id}
            onClick={() => {
              if (!isActive && !isEditingThis) {
                chalkSounds.playTap();
                onSelectBoard(b.id);
              }
            }}
            className={`group/tab relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer whitespace-nowrap shadow-sm ${
              isActive
                ? 'bg-white/20 border-white/60 text-white font-bold shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                : 'bg-black/30 border-white/15 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            {isEditingThis ? (
              <div 
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  ref={editInputRef}
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => handleFinishRename(b.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFinishRename(b.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="bg-transparent border-b border-white outline-none text-white px-1 py-0.5 min-w-[70px]"
                  maxLength={40}
                />
                <button
                  type="button"
                  onClick={() => handleFinishRename(b.id)}
                  className="p-0.5 text-white hover:text-emerald-300"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <span className="text-[11px] opacity-60">#{idx + 1}</span>
                <span
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingId(b.id);
                    setEditingTitle(b.title);
                  }}
                  title="انقر للتبديل، أو انقر مرتين لإعادة تسمية الصبورة"
                  className="tracking-wide"
                >
                  {b.title}
                </span>

                {/* Edit & Delete tab options */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover/tab:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      chalkSounds.playTap();
                      setEditingId(b.id);
                      setEditingTitle(b.title);
                    }}
                    title="تعديل اسم الصبورة"
                    className="p-0.5 text-white/50 hover:text-white transition-colors"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                  </button>

                  {boards.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        chalkSounds.playErase();
                        onDeleteBoard(b.id);
                      }}
                      title="حذف هذه الصبورة"
                      className="p-0.5 text-red-300/60 hover:text-red-300 transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* Add New Board Button / Inline Input */}
      {isCreating ? (
        <form 
          onSubmit={handleFinishCreate}
          className="flex items-center gap-1 bg-black/50 border border-amber-400/60 rounded-xl px-2.5 py-1 text-xs shadow-md"
        >
          <input
            ref={createInputRef}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={() => {
              if (!newTitle.trim()) setIsCreating(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsCreating(false);
            }}
            placeholder="اسم الصبورة الجديدة..."
            className="bg-transparent border-none outline-none text-white text-xs w-28 placeholder:text-white/40"
            maxLength={40}
          />
          <button
            type="submit"
            className="p-1 rounded bg-amber-400 text-black hover:bg-amber-300 transition-colors cursor-pointer"
          >
            <Check className="w-3 h-3 stroke-[3]" />
          </button>
          <button
            type="button"
            onClick={() => setIsCreating(false)}
            className="p-1 rounded text-white/60 hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => {
            chalkSounds.playTap();
            setIsCreating(true);
          }}
          title="إنشاء صبورة عمل جديدة"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-dashed border-white/30 text-amber-300 hover:text-white text-xs transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>صبورة جديدة +</span>
        </button>
      )}
    </div>
  );
};
