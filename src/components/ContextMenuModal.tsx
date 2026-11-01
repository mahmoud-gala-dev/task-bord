import React, { useRef, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Layers, 
  RotateCcw, 
  Maximize, 
  Minimize, 
  Palette, 
  Type, 
  Sparkles,
  Pencil,
  Sliders,
  Brain,
  Clock,
  Eye,
  EyeOff,
  Image as ImageIcon
} from 'lucide-react';
import { ChalkColor, BoardThemeId, FilterType, FontChoice, BoardEffectsSettings } from '../types';
import { BOARD_THEMES, CHALK_PALETTE } from '../utils/themes';
import { chalkSounds } from '../utils/audio';

interface ContextMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: BoardThemeId;
  onSelectTheme: (id: BoardThemeId) => void;
  selectedColor: ChalkColor;
  onSelectColor: (color: ChalkColor) => void;
  fontChoice: FontChoice;
  onFontChange: (font: FontChoice) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  totalCount: number;
  completedCount: number;
  freeNotesCount: number;
  strokesCount?: number;
  onClearFreeNotes: () => void;
  onClearStrokes?: () => void;
  onEraseCompleted: () => void;
  onResetBoard: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  effects?: BoardEffectsSettings;
  onToggleEffect?: (key: keyof BoardEffectsSettings) => void;
  onOpenEffectsModal?: () => void;
  onOpenXMind?: () => void;
  onOpenFocusTimer?: () => void;
  onOpenBackgroundModal?: () => void;
  isTopToolbarVisible?: boolean;
  onToggleTopToolbar?: () => void;
}

export const ContextMenuModal: React.FC<ContextMenuModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
  selectedColor,
  onSelectColor,
  fontChoice,
  onFontChange,
  soundEnabled,
  onToggleSound,
  filter,
  onFilterChange,
  totalCount,
  completedCount,
  freeNotesCount,
  strokesCount = 0,
  onClearFreeNotes,
  onClearStrokes,
  onEraseCompleted,
  onResetBoard,
  isFullscreen,
  onToggleFullscreen,
  effects,
  onToggleEffect,
  onOpenEffectsModal,
  onOpenXMind,
  onOpenFocusTimer,
  onOpenBackgroundModal,
  isTopToolbarVisible = true,
  onToggleTopToolbar,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const themesList = Object.values(BOARD_THEMES);
  const chalkColors: ChalkColor[] = ['white', 'yellow', 'cyan', 'pink', 'mint'];
  const activeCount = totalCount - completedCount;

  // Realistic Arabic handwriting fonts mimicking pen/chalk on blackboard
  const handwritingFonts: { id: FontChoice; name: string; subtitle: string; fontClass: string }[] = [
    {
      id: 'aref',
      name: 'خط الرقعة اليدوي',
      subtitle: 'حركات قلم الرقعة المائلة الأصيلة',
      fontClass: 'font-handwriting-ruqaa text-sm',
    },
    {
      id: 'katibeh',
      name: 'خط الكتيبة المتصل',
      subtitle: 'حركات سريعة رشيقة مثل كتابة المعلم',
      fontClass: 'font-handwriting-katibeh text-base',
    },
    {
      id: 'rakkas',
      name: 'خط الرقاص الفني',
      subtitle: 'رسم يدوي عريض بنكهة تراثية',
      fontClass: 'font-handwriting-rakkas text-sm',
    },
    {
      id: 'lateef',
      name: 'خط لطيف المنساب',
      subtitle: 'انسيابية كلاسيكية تشبه حبر القلم',
      fontClass: 'font-handwriting-lateef text-base',
    },
    {
      id: 'amiri',
      name: 'خط النسخ العربي',
      subtitle: 'أصالة الخط العربي التقليدي',
      fontClass: 'font-handwriting-amiri text-base',
    },
    {
      id: 'chalk',
      name: 'مرح الطبشور الحر',
      subtitle: 'عفوي شبابي خفيف',
      fontClass: 'font-handwriting-chalk text-xs',
    },
    {
      id: 'kufi',
      name: 'خط كوفي مخطوط',
      subtitle: 'حروف هندسية يدوية',
      fontClass: 'font-handwriting-kufi text-xs',
    },
    {
      id: 'modern',
      name: 'خط ألكسندريا الحديث',
      subtitle: 'واضح وعصري',
      fontClass: 'font-modern text-xs',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md transition-opacity duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-neutral-900/95 border border-white/20 rounded-2xl p-5 sm:p-6 shadow-2xl text-white flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 20px 50px rgba(0,0,0,0.85)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-white/10 text-white border border-white/15">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                إمكانيات وتخصيص السبورة
              </h2>
              <p className="text-[11px] text-white/50">
                تشكيلة خطوط اليد الواقعية، تدرجات السبورة، والخيارات
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section: Themes */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-amber-300" />
            تدرج خلفية السبورة (Themes):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {themesList.map((t) => {
              const isSelected = currentThemeId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    chalkSounds.playTap();
                    onSelectTheme(t.id);
                  }}
                  className={`p-2 rounded-xl border text-right transition-all cursor-pointer flex flex-col gap-1 relative overflow-hidden group ${
                    isSelected
                      ? 'border-white ring-2 ring-white/50 scale-[1.02]'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                  style={{ background: t.backgroundStyle }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white drop-shadow">
                      {t.name}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </div>
                  <span className="text-[10px] text-white/60 drop-shadow">
                    {t.subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Launcher for Custom Wood/Chalkboard Background Studio */}
          {onOpenBackgroundModal && (
            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                onOpenBackgroundModal();
                onClose();
              }}
              className="mt-1 flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-stone-900/60 to-black/60 border border-amber-600/30 hover:border-amber-400/60 hover:bg-amber-950/60 transition-all text-xs cursor-pointer group shadow-md"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 group-hover:bg-amber-400 group-hover:text-black transition-colors">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-bold text-white group-hover:text-amber-200">
                    توليد وتخصيص خلفيات الألواح الخشبية والسبورات المدرسية 🪵
                  </span>
                  <span className="text-[10px] text-white/50">
                    اختر ألواح بلوط معتق، سبورة مدرسية زمردية، أو صمم لوحك المخصص
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
                فتح المعرض 🖼️
              </span>
            </button>
          )}
        </div>

        {/* Section: Realistic Handwriting Font Choices */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-amber-300" />
              خطوط اليد العربية الأصيلة (مطابقة تماماً لخط اليد والطبشور):
            </span>
            <span className="text-[10px] text-amber-300/80 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
              8 خطوط يدوية
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {handwritingFonts.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  chalkSounds.playTap();
                  onFontChange(item.id);
                }}
                className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-center gap-0.5 ${
                  fontChoice === item.id
                    ? 'bg-amber-500/15 border-amber-400/70 text-white ring-1 ring-amber-400/50 shadow-md'
                    : 'bg-black/30 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`${item.fontClass} tracking-wide text-white`}>
                    {item.name}
                  </span>
                  {fontChoice === item.id && (
                    <span className="text-[10px] font-mono bg-amber-400 text-black font-bold px-1.5 py-0.5 rounded-md">
                      مفعل
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-white/40">
                  {item.subtitle}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Section: Chalk Color */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-white/80">
            لون طبشور الكتابة الافتراضي:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {chalkColors.map((color) => {
              const info = CHALK_PALETTE[color];
              const isSelected = selectedColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    chalkSounds.playTap();
                    onSelectColor(color);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/20 border-white text-white shadow-sm'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-white/40"
                    style={{ backgroundColor: info.colorHex }}
                  />
                  <span>{info.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section: Task Filters */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-300" />
            تصفية المهام المعروضة:
          </span>
          <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                onFilterChange('all');
              }}
              className={`py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white/20 text-white font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              الكل ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                onFilterChange('active');
              }}
              className={`py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                filter === 'active'
                  ? 'bg-white/20 text-white font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              قيد الإنجاز ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                onFilterChange('completed');
              }}
              className={`py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                filter === 'completed'
                  ? 'bg-white/20 text-white font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              المكتملة ({completedCount})
            </button>
          </div>
        </div>

        {/* Section: XMind Chalk Mind Map Tool */}
        {onOpenXMind && (
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-amber-300" />
                خريطة ذهن XMind التفاعلية (بوكسات الكتابة):
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-pink-500/10 border border-amber-400/30">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-amber-300">خريطة XMind للأفكار والمهام 🧠</span>
                <span className="text-[11px] text-white/60">تنظيم وهيكلة المهام كشجرة أفكار طبشورية ببوكسات كتابة طبيعية ومزامنة ذكية</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  chalkSounds.playChalkStroke();
                  onClose();
                  onOpenXMind();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              >
                فتح الخريطة 🚀
              </button>
            </div>
          </div>
        )}

        {/* Section: Focus Timer Tool */}
        {onOpenFocusTimer && (
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                أداة وقت التركيز وإشعارات كروم (25% - 50% - 75% - 100%):
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-cyan-500/10 border border-emerald-400/30">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-emerald-300">مؤقت التركيز مع البروجرس بار الطبشوري ⏱️</span>
                <span className="text-[11px] text-white/60">تنبيهات تلقائية في Google Chrome، ومؤثرات صوتية، وشريط تقدم مرسوم باليد</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  chalkSounds.playTap();
                  onClose();
                  onOpenFocusTimer();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              >
                تشغيل المؤقت ⏱️
              </button>
            </div>
          </div>
        )}

        {/* Section: Live Chalkboard Visual Effects */}
        {effects && onToggleEffect && (
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                تأثيرات السبورة الواقعية (إخفاء / تفعيل):
              </span>
              {onOpenEffectsModal && (
                <button
                  type="button"
                  onClick={() => {
                    chalkSounds.playTap();
                    onClose();
                    onOpenEffectsModal();
                  }}
                  className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Sliders className="w-3 h-3" />
                  <span>لوحة التحكم الكاملة في التأثيرات</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { key: 'chippedEdges', name: 'حواف متآكلة ومكسورة' },
                { key: 'chalkBorder', name: 'إطار الطبشور اليدوي' },
                { key: 'frameVignette', name: 'تظليل حواف الإطار' },
                { key: 'dustGrain', name: 'تدرج مسحات الغبار' },
                { key: 'gritNoise', name: 'خشونة الحجر SVG' },
                { key: 'depthOfField', name: 'عمق الميدان عند التقريب' },
              ].map((item) => {
                const isEnabled = !!effects[item.key as keyof BoardEffectsSettings];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      chalkSounds.playTap();
                      onToggleEffect(item.key as keyof BoardEffectsSettings);
                    }}
                    className={`p-2 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                      isEnabled
                        ? 'bg-amber-500/15 border-amber-400/60 text-white ring-1 ring-amber-400/30 shadow-sm'
                        : 'bg-black/30 border-white/10 text-white/50 hover:bg-white/5 hover:text-white/80'
                    }`}
                  >
                    <span className="text-[11px] font-medium leading-tight">
                      {item.name}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                        isEnabled
                          ? 'bg-amber-400 text-black'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {isEnabled ? 'مفعّل' : 'معطّل'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Section: Sound & Board Controls */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
          <span className="text-xs font-semibold text-white/80">
            الإعدادات العامة وإدارة السبورة:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Sound toggle */}
            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                onToggleSound();
              }}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-white/40" />
                )}
                <span>أصوات الطبشور والمسح</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${soundEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/50'}`}>
                {soundEnabled ? 'مفعل' : 'مكتوم'}
              </span>
            </button>

            {/* Top Toolbar Visibility toggle */}
            {onToggleTopToolbar && (
              <button
                type="button"
                onClick={() => {
                  chalkSounds.playTap();
                  onToggleTopToolbar();
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {isTopToolbarVisible ? (
                    <Eye className="w-4 h-4 text-amber-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-white/40" />
                  )}
                  <span>شريط الأدوات العلوي</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isTopToolbarVisible ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-white/50'}`}>
                  {isTopToolbarVisible ? 'ظاهر' : 'مخفي'}
                </span>
              </button>
            )}

            {/* Fullscreen toggle */}
            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                onToggleFullscreen();
              }}
              className="flex items-center justify-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 hover:text-white transition-all cursor-pointer"
            >
              {isFullscreen ? (
                <>
                  <Minimize className="w-3.5 h-3.5" />
                  <span>إنهاء ملء الشاشة</span>
                </>
              ) : (
                <>
                  <Maximize className="w-3.5 h-3.5" />
                  <span>ملء الشاشة</span>
                </>
              )}
            </button>
          </div>

          {/* Destructive Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-1">
            {completedCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  chalkSounds.playErase();
                  onEraseCompleted();
                }}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs text-amber-200 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>مسح المكتملة ({completedCount})</span>
              </button>
            )}

            {freeNotesCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  chalkSounds.playErase();
                  onClearFreeNotes();
                }}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/70 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>مسح الملاحظات الحرة</span>
              </button>
            )}

            {strokesCount > 0 && onClearStrokes && (
              <button
                type="button"
                onClick={() => {
                  chalkSounds.playErase();
                  onClearStrokes();
                }}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-cyan-300 transition-all cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>مسح رسومات الطبشور ({strokesCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                chalkSounds.playErase();
                onResetBoard();
              }}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs text-red-300 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>تفريغ السبورة كلياً</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
