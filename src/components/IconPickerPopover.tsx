import React from 'react';
import { 
  X, 
  Smile, 
  Star, 
  Heart, 
  CheckCircle, 
  Clock, 
  Flame, 
  Lightbulb, 
  Flag, 
  Pin, 
  Bookmark, 
  Sparkles, 
  BookOpen, 
  Coffee, 
  Calendar, 
  Target, 
  Zap, 
  Folder, 
  Bell, 
  Award, 
  AlertCircle 
} from 'lucide-react';
import { chalkSounds } from '../utils/audio';

export const CHALK_ICONS = [
  { id: 'star', label: 'نجمة مميزة', icon: '⭐' },
  { id: 'pin', label: 'دبوس تثبيت', icon: '📌' },
  { id: 'target', label: 'هدف رئيسي', icon: '🎯' },
  { id: 'fire', label: 'عاجل وهام', icon: '🔥' },
  { id: 'idea', label: 'فكرة ملهمة', icon: '💡' },
  { id: 'book', label: 'قراءة وتعلم', icon: '📖' },
  { id: 'coffee', label: 'استراحة ورواقة', icon: '☕' },
  { id: 'check', label: 'مهمة منجزة', icon: '✅' },
  { id: 'bell', label: 'تذكير وموعد', icon: '🔔' },
  { id: 'heart', label: 'مفضلة وقريبة', icon: '❤️' },
  { id: 'sparkles', label: 'إبداع ولمعان', icon: '✨' },
  { id: 'flag', label: 'راية أولوية', icon: '🚩' },
  { id: 'memo', label: 'ملاحظة سريعة', icon: '📝' },
  { id: 'zap', label: 'طاقة وسرعة', icon: '⚡' },
  { id: 'calendar', label: 'تاريخ وجدول', icon: '📅' },
  { id: 'trophy', label: 'إنجاز وجائزة', icon: '🏆' },
];

interface IconPickerPopoverProps {
  onSelectIcon: (icon: string) => void;
  onRemoveIcon?: () => void;
  currentIcon?: string;
  onClose: () => void;
  title?: string;
}

export const IconPickerPopover: React.FC<IconPickerPopoverProps> = ({
  onSelectIcon,
  onRemoveIcon,
  currentIcon,
  onClose,
  title = 'اختر أيقونة مناسبة',
}) => {
  return (
    <div 
      className="absolute z-50 bg-neutral-900/95 border border-white/20 rounded-xl p-2.5 shadow-2xl backdrop-blur-md w-64 animate-in fade-in zoom-in-95 pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
      style={{
        boxShadow: '0 10px 25px rgba(0,0,0,0.8), 0 0 10px rgba(255,255,255,0.1)',
      }}
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
        <span className="font-bold text-amber-300 flex items-center gap-1">
          <Smile className="w-3.5 h-3.5" />
          <span>{title}</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-white/40 hover:text-white p-0.5 rounded cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto pr-0.5">
        {CHALK_ICONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              chalkSounds.playTap();
              onSelectIcon(item.icon);
              onClose();
            }}
            title={item.label}
            className={`p-2 rounded-lg text-lg flex items-center justify-center transition-all cursor-pointer hover:scale-115 hover:bg-white/15 ${
              currentIcon === item.icon
                ? 'bg-amber-400/20 ring-1 ring-amber-400'
                : 'bg-white/5'
            }`}
          >
            <span>{item.icon}</span>
          </button>
        ))}
      </div>

      {currentIcon && onRemoveIcon && (
        <button
          type="button"
          onClick={() => {
            chalkSounds.playErase();
            onRemoveIcon();
            onClose();
          }}
          className="w-full mt-2 py-1 text-center text-[11px] text-red-300/80 hover:text-red-200 hover:bg-red-500/10 rounded border border-red-500/20 transition-colors cursor-pointer"
        >
          إزالة الأيقونة الحالية
        </button>
      )}
    </div>
  );
};
