import React from 'react';
import { X, Sparkles, Flame, CheckCircle2, Bookmark, Star, Clock, Heart, Award, Zap, Coffee, Lightbulb } from 'lucide-react';
import { ChalkColor } from '../types';
import { chalkSounds } from '../utils/audio';

export interface StickerPreset {
  id: string;
  icon: string;
  label: string;
  category: 'status' | 'study' | 'priority' | 'fun';
  badgeStyle: 'emoji' | 'chalk-badge' | 'pin-note' | 'stamp';
  defaultColor?: ChalkColor;
}

export const STICKER_PRESETS: StickerPreset[] = [
  // طوابع وشارات هامة وعاجلة
  { id: 'urgent-stamp', icon: '🔥', label: 'عاجل جداً', category: 'priority', badgeStyle: 'chalk-badge', defaultColor: 'pink' },
  { id: 'important-stamp', icon: '⭐', label: 'هام ومميز', category: 'priority', badgeStyle: 'chalk-badge', defaultColor: 'yellow' },
  { id: 'done-stamp', icon: '✅', label: 'تم الإنجاز', category: 'status', badgeStyle: 'chalk-badge', defaultColor: 'mint' },
  { id: 'review-stamp', icon: '🔍', label: 'قيد المراجعة', category: 'status', badgeStyle: 'chalk-badge', defaultColor: 'cyan' },
  { id: 'goal-stamp', icon: '🎯', label: 'الهدف اليومي', category: 'priority', badgeStyle: 'chalk-badge', defaultColor: 'yellow' },

  // دراسة وأفكار وعمل
  { id: 'idea-pin', icon: '💡', label: 'فكرة ذهبية', category: 'study', badgeStyle: 'pin-note', defaultColor: 'yellow' },
  { id: 'book-pin', icon: '📖', label: 'قراءة ومذاكرة', category: 'study', badgeStyle: 'pin-note', defaultColor: 'white' },
  { id: 'memo-pin', icon: '📝', label: 'تذكير مهم', category: 'study', badgeStyle: 'pin-note', defaultColor: 'cyan' },
  { id: 'pin-pin', icon: '📌', label: 'مثبت هنا', category: 'study', badgeStyle: 'pin-note', defaultColor: 'pink' },

  // راحة ومشاعر وتحفيز
  { id: 'coffee-fun', icon: '☕', label: 'وقت الاستراحة', category: 'fun', badgeStyle: 'emoji', defaultColor: 'white' },
  { id: 'star-trophy', icon: '🏆', label: 'إنجاز أسطوري', category: 'fun', badgeStyle: 'emoji', defaultColor: 'yellow' },
  { id: 'heart-fun', icon: '❤️', label: 'عمل محبب', category: 'fun', badgeStyle: 'emoji', defaultColor: 'pink' },
  { id: 'zap-speed', icon: '⚡', label: 'إنجاز سريع', category: 'fun', badgeStyle: 'emoji', defaultColor: 'yellow' },
  { id: 'clock-time', icon: '⏰', label: 'موعد قريب', category: 'status', badgeStyle: 'pin-note', defaultColor: 'cyan' },
  { id: 'sparkles-magic', icon: '✨', label: 'لمسة إبداع', category: 'fun', badgeStyle: 'emoji', defaultColor: 'mint' },
  { id: 'badge-award', icon: '🎖️', label: 'وسام الشرف', category: 'fun', badgeStyle: 'emoji', defaultColor: 'yellow' },
  { id: 'rocket-fly', icon: '🚀', label: 'انطلاقة قوية', category: 'fun', badgeStyle: 'emoji', defaultColor: 'cyan' },
  { id: 'flag-mark', icon: '🚩', label: 'علامة مرحلية', category: 'status', badgeStyle: 'pin-note', defaultColor: 'pink' },
];

interface StickerTrayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSticker: (preset: StickerPreset) => void;
}

export const StickerTrayModal: React.FC<StickerTrayModalProps> = ({
  isOpen,
  onClose,
  onSelectSticker,
}) => {
  const [selectedCat, setSelectedCat] = React.useState<string>('all');

  if (!isOpen) return null;

  const filtered = selectedCat === 'all'
    ? STICKER_PRESETS
    : STICKER_PRESETS.filter((s) => s.category === selectedCat);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
      dir="rtl"
    >
      <div 
        className="relative w-full max-w-md bg-neutral-900/95 border border-white/20 rounded-2xl p-5 shadow-2xl text-white flex flex-col gap-4 max-h-[85vh] overflow-y-auto pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 20px 50px rgba(0,0,0,0.9), 0 0 20px rgba(255,255,255,0.1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <div>
              <h3 className="text-sm font-bold text-white">إضافة ستيكرات طبشورية</h3>
              <p className="text-[11px] text-white/50">يمكنك سحب وتحريك الستيكر بحرية وتكبيره وتدويره في أي مكان بالصبورة</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Tab */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'priority', label: 'أولوية وطوابع' },
            { id: 'study', label: 'دراسة وأفكار' },
            { id: 'status', label: 'حالة وتذكير' },
            { id: 'fun', label: 'تحفيز ومرح' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                setSelectedCat(cat.id);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${
                selectedCat === cat.id
                  ? 'bg-amber-400 text-black font-bold shadow-sm'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Stickers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-0.5">
          {filtered.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                chalkSounds.playChalkStroke();
                onSelectSticker(preset);
                onClose();
              }}
              className="group p-3 rounded-xl border border-white/10 bg-black/40 hover:bg-white/10 hover:border-amber-400/60 hover:scale-105 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <span className="text-3xl filter drop-shadow group-hover:scale-110 transition-transform">
                {preset.icon}
              </span>
              <span className="text-xs font-semibold text-white/90 group-hover:text-amber-300">
                {preset.label}
              </span>
              <span className="text-[10px] text-white/40">
                انقر للإضافة
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
