import React, { useState, useRef, useEffect } from 'react';
import { Plus, CornerDownLeft } from 'lucide-react';
import { ChalkColor, FontChoice } from '../types';
import { CHALK_PALETTE } from '../utils/themes';
import { getHandwritingFontClass } from '../utils/fonts';
import { chalkSounds } from '../utils/audio';

interface TaskInputProps {
  onAddTask: (taskName: string, color: ChalkColor) => void;
  currentColor: ChalkColor;
  fontChoice: FontChoice;
}

export const TaskInput: React.FC<TaskInputProps> = ({
  onAddTask,
  currentColor,
  fontChoice,
}) => {
  const [taskName, setTaskName] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height as text expands into multiple lines
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(180, textareaRef.current.scrollHeight)}px`;
    }
  }, [taskName]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = taskName.trim();
    if (!trimmed) {
      textareaRef.current?.focus();
      return;
    }
    chalkSounds.playChalkStroke();
    onAddTask(trimmed, currentColor);
    setTaskName('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without Shift commits the task
    // Shift+Enter creates a new line for multiline tasks
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const chalkInfo = CHALK_PALETTE[currentColor] || CHALK_PALETTE.white;
  const fontClass = getHandwritingFontClass(fontChoice, 'lg');

  return (
    <form onSubmit={handleSubmit} className="relative w-full group py-1">
      <div className="relative flex items-start gap-3 px-2 py-2 border-b border-white/20 focus-within:border-white/60 transition-colors">
        {/* Subtle chalk bullet */}
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0 opacity-90 mt-2.5"
          style={{ backgroundColor: chalkInfo.colorHex }}
        />

        {/* Multiline textarea written directly in handwriting on the board */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={taskName}
          onChange={(e) => {
            setTaskName(e.target.value);
            chalkSounds.playTap();
          }}
          onKeyDown={handleKeyDown}
          placeholder="اكتب مهمة جديدة ثم اضغط Enter (أو Shift+Enter لسطر جديد)..."
          className={`w-full bg-transparent border-none outline-none placeholder:text-white/35 text-white resize-none leading-relaxed overflow-y-auto ${fontClass} ${chalkInfo.textClass} ${chalkInfo.glowClass}`}
          style={{
            maxHeight: '180px',
            minHeight: '36px',
          }}
          maxLength={500}
        />

        {/* Quick add button and Shift+Enter hint */}
        <div className="shrink-0 flex items-center gap-1.5 mt-1">
          {taskName.includes('\n') && (
            <span className="text-[10px] text-white/40 font-mono hidden sm:inline" title="مهمة متعددة الأسطر">
              سطور متعددة ↵
            </span>
          )}
          {taskName.trim() && (
            <button
              type="submit"
              title="إضافة المهمة (Enter)"
              className="flex items-center gap-1 text-xs text-amber-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="font-sans font-bold">إضافة</span>
            </button>
          )}
        </div>
      </div>
    </form>
  );
};
