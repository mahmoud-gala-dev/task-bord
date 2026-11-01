import React, { useRef, useEffect } from 'react';
import { 
  Type, 
  Sparkles, 
  CheckSquare, 
  Pencil, 
  Layers,
  Palette,
  Brain,
  Clock,
  Eye,
  EyeOff,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { ChalkColor } from '../types';
import { CHALK_PALETTE } from '../utils/themes';
import { chalkSounds } from '../utils/audio';
import { STICKER_PRESETS, StickerPreset } from './StickerTrayModal';

interface BoardContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onAddNoteAtPos: () => void;
  onAddTaskAtPos: () => void;
  onOpenStickerTray: () => void;
  onSelectQuickSticker: (preset: StickerPreset) => void;
  onActivateDrawing: () => void;
  onOpenXMind?: () => void;
  onOpenFocusTimer?: () => void;
  onOpenBackgroundModal?: () => void;
  isTopToolbarVisible?: boolean;
  onToggleTopToolbar?: () => void;
  currentColor: ChalkColor;
  onSelectColor: (color: ChalkColor) => void;
}

export const BoardContextMenu: React.FC<BoardContextMenuProps> = ({
  isOpen,
  x,
  y,
  onClose,
  onAddNoteAtPos,
  onAddTaskAtPos,
  onOpenStickerTray,
  onSelectQuickSticker,
  onActivateDrawing,
  onOpenXMind,
  onOpenFocusTimer,
  onOpenBackgroundModal,
  isTopToolbarVisible = true,
  onToggleTopToolbar,
  currentColor,
  onSelectColor,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Ensure menu stays within window viewport boundaries
  const menuWidth = 260;
  const menuHeight = 360;
  const adjustedX = Math.max(10, Math.min(window.innerWidth - menuWidth - 10, x));
  const adjustedY = Math.max(10, Math.min(window.innerHeight - menuHeight - 10, y));

  // Popular quick stickers for fast one-click stamp insertion
  const popularPresets = STICKER_PRESETS.slice(0, 6);
  const chalkColors: ChalkColor[] = ['white', 'yellow', 'cyan', 'pink', 'mint'];

  return (
    <div
      ref={menuRef}
      style={{
        left: `${adjustedX}px`,
        top: `${adjustedY}px`,
        boxShadow: '0 0 0 1px rgba(255,255,255,0.15), 0 20px 45px rgba(0,0,0,0.85)',
      }}
      className="fixed z-50 w-64 bg-neutral-900/95 border border-white/20 backdrop-blur-md rounded-2xl p-2.5 text-white flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-100 select-none pointer-events-auto"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Header title */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-white/10 text-white/50 text-[11px] font-mono">
        <span className="flex items-center gap-1 text-white/80 font-bold">
          <Layers className="w-3.5 h-3.5 text-amber-300" />
          إضافة سريعة على الصبورة
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Options: Free Note, Task, Sticker Tray */}
      <div className="flex flex-col gap-0.5">
        {/* 1. Add Free Note here */}
        <button
          type="button"
          onClick={() => {
            chalkSounds.playTap();
            onAddNoteAtPos();
            onClose();
          }}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-amber-400/15 hover:text-amber-300 transition-all text-xs font-bold text-right cursor-pointer group"
        >
          <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 group-hover:bg-amber-400 group-hover:text-black transition-colors">
            <Type className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="flex flex-col text-right">
            <span>كتابة حرة هنا</span>
            <span className="text-[10px] text-white/40 font-normal">إضافة ملاحظة طبشورية في نفس الموضع</span>
          </div>
        </button>

        {/* 2. Add Task */}
        <button
          type="button"
          onClick={() => {
            chalkSounds.playTap();
            onAddTaskAtPos();
            onClose();
          }}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-emerald-400/15 hover:text-emerald-300 transition-all text-xs font-bold text-right cursor-pointer group"
        >
          <div className="p-1.5 rounded-lg bg-emerald-400/20 text-emerald-300 group-hover:bg-emerald-400 group-hover:text-black transition-colors">
            <CheckSquare className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="flex flex-col text-right">
            <span>إضافة مهمة جديدة</span>
            <span className="text-[10px] text-white/40 font-normal">إدراج مهمة وقائمة فرعية في قائمة المهام</span>
          </div>
        </button>

        {/* 3. Open Stickers Gallery */}
        <button
          type="button"
          onClick={() => {
            chalkSounds.playTap();
            onOpenStickerTray();
            onClose();
          }}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-pink-400/15 hover:text-pink-300 transition-all text-xs font-bold text-right cursor-pointer group"
        >
          <div className="p-1.5 rounded-lg bg-pink-400/20 text-pink-300 group-hover:bg-pink-400 group-hover:text-black transition-colors">
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="flex flex-col text-right">
            <span>معرض الستيكرات والشارات</span>
            <span className="text-[10px] text-white/40 font-normal">تصفح الشارات، الطوابع والأيقونات التفاعلية</span>
          </div>
        </button>

        {/* 4. Switch to Chalk Pen drawing */}
        <button
          type="button"
          onClick={() => {
            chalkSounds.playChalkStroke();
            onActivateDrawing();
            onClose();
          }}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-cyan-400/15 hover:text-cyan-300 transition-all text-xs font-bold text-right cursor-pointer group"
        >
          <div className="p-1.5 rounded-lg bg-cyan-400/20 text-cyan-300 group-hover:bg-cyan-400 group-hover:text-black transition-colors">
            <Pencil className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="flex flex-col text-right">
            <span>رسم بالطبشور الحر</span>
            <span className="text-[10px] text-white/40 font-normal">تفعيل قلم الشخبطة والتخطيط</span>
          </div>
        </button>

        {/* 5. Open XMind Mind Map */}
        {onOpenXMind && (
          <button
            type="button"
            onClick={() => {
              chalkSounds.playChalkStroke();
              onOpenXMind();
              onClose();
            }}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-amber-400/20 hover:text-amber-300 transition-all text-xs font-bold text-right cursor-pointer group"
          >
            <div className="p-1.5 rounded-lg bg-amber-400/25 text-amber-300 group-hover:bg-amber-400 group-hover:text-black transition-colors">
              <Brain className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex flex-col text-right">
              <span>خريطة ذهن XMind 🧠</span>
              <span className="text-[10px] text-amber-200/60 font-normal">عرض الأفكار والمهام كخريطة ذهنية</span>
            </div>
          </button>
        )}

        {/* 6. Open Focus Timer */}
        {onOpenFocusTimer && (
          <button
            type="button"
            onClick={() => {
              chalkSounds.playTap();
              onOpenFocusTimer();
              onClose();
            }}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-amber-400/20 hover:text-amber-300 transition-all text-xs font-bold text-right cursor-pointer group"
          >
            <div className="p-1.5 rounded-lg bg-amber-400/25 text-amber-300 group-hover:bg-amber-400 group-hover:text-black transition-colors">
              <Clock className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex flex-col text-right">
              <span>وقت التركيز (Timer) ⏱️</span>
              <span className="text-[10px] text-amber-200/60 font-normal">إشعارات كروم وبروجرس بار طبشوري</span>
            </div>
          </button>
        )}

        {/* 7. Board Backgrounds (Vintage Wood Planks & Classroom Slates) */}
        {onOpenBackgroundModal && (
          <button
            type="button"
            onClick={() => {
              chalkSounds.playTap();
              onOpenBackgroundModal();
              onClose();
            }}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-amber-400/20 hover:text-amber-300 transition-all text-xs font-bold text-right cursor-pointer group"
          >
            <div className="p-1.5 rounded-lg bg-amber-400/25 text-amber-300 group-hover:bg-amber-400 group-hover:text-black transition-colors">
              <ImageIcon className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex flex-col text-right">
              <span>خلفيات الألواح والسبورات 🖼️</span>
              <span className="text-[10px] text-amber-200/60 font-normal">ألواح خشب قديمة وسبورات مدرسية عتيقة</span>
            </div>
          </button>
        )}

        {/* 8. Toggle Top Toolbar Visibility */}
        {onToggleTopToolbar && (
          <button
            type="button"
            onClick={() => {
              chalkSounds.playTap();
              onToggleTopToolbar();
              onClose();
            }}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/10 text-white/90 hover:text-white transition-all text-xs font-bold text-right cursor-pointer group"
          >
            <div className="p-1.5 rounded-lg bg-white/10 group-hover:bg-white/20 text-amber-300 transition-colors">
              {isTopToolbarVisible ? (
                <EyeOff className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <Eye className="w-4 h-4 stroke-[2.5]" />
              )}
            </div>
            <div className="flex flex-col text-right">
              <span>{isTopToolbarVisible ? 'إخفاء شريط الأدوات العلوي' : 'إظهار شريط الأدوات العلوي'}</span>
              <span className="text-[10px] text-white/40 font-normal">
                {isTopToolbarVisible ? 'إخفاء الشريط للتركيز الكامل على مساحة السبورة' : 'إعادة إظهار الشريط العلوي والخيارات'}
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Quick Stickers Row */}
      <div className="pt-2 border-t border-white/10 flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold text-white/60 px-1">
          ستيكر فوري في هذا الموضع:
        </span>
        <div className="grid grid-cols-6 gap-1 bg-black/40 p-1.5 rounded-xl border border-white/10">
          {popularPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                onSelectQuickSticker(preset);
                onClose();
              }}
              title={preset.label}
              className="p-1.5 rounded-lg hover:bg-white/15 hover:scale-125 transition-transform flex items-center justify-center text-lg cursor-pointer"
            >
              {preset.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Chalk Color Selector */}
      <div className="pt-1.5 border-t border-white/10 flex items-center justify-between px-1">
        <span className="text-[11px] text-white/60 flex items-center gap-1">
          <Palette className="w-3 h-3 text-amber-300" />
          لون الطبشور:
        </span>
        <div className="flex items-center gap-1.5">
          {chalkColors.map((color) => {
            const isSelected = currentColor === color;
            const info = CHALK_PALETTE[color];
            return (
              <button
                key={color}
                type="button"
                onClick={() => {
                  chalkSounds.playTap();
                  onSelectColor(color);
                }}
                title={info.name}
                className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                  isSelected ? 'border-white scale-125 shadow-sm' : 'border-white/30 hover:scale-110'
                }`}
                style={{ backgroundColor: info.colorHex }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
