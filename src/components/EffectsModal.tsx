import React, { useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Crop, 
  Square, 
  Wind, 
  Layers, 
  Eye, 
  SunMedium, 
  Check, 
  RotateCcw,
  Sliders,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { BoardEffectsSettings, DEFAULT_BOARD_EFFECTS } from '../types';
import { chalkSounds } from '../utils/audio';

interface EffectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  effects: BoardEffectsSettings;
  onToggleEffect: (key: keyof BoardEffectsSettings) => void;
  onSetAllEffects: (value: boolean) => void;
  onResetEffects: () => void;
}

interface EffectConfig {
  key: keyof BoardEffectsSettings;
  name: string;
  category: string;
  description: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  visualHint: string;
}

export const EFFECTS_CONFIG: EffectConfig[] = [
  {
    key: 'chippedEdges',
    name: 'تأثير حواف السبورة المتآكلة والمكسورة',
    category: 'هيكل السبورة الفيزيائي',
    description: 'يقوم بقص أطراف الشاشة بقناع وهندسة مكسورة عشوائية (Clip-path & Mask) لمحاكاة الحواف الصخرية غير المنتظمة والمتآكلة للسبورات القديمة.',
    badge: 'Clip-path & SVG Mask',
    icon: Crop,
    visualHint: 'حواف حجرية متعرجة مع شقوق دقيقة في أطراف الشاشة',
  },
  {
    key: 'chalkBorder',
    name: 'إطار الطبشور اليدوي المخروطي',
    category: 'التأطير والحدود',
    description: 'يرسم إطاراً عريضاً محيطاً بكامل نافذة السبورة بضربات طباشيرية متدرجة عبر تكرار التدرج المخروطي (Repeating Conic Gradient).',
    badge: 'Conic Gradient Border',
    icon: Square,
    visualHint: 'إطار طبشوري أبيض غير متجانس يحيط بجميع حواف النافذة',
  },
  {
    key: 'frameVignette',
    name: 'تظليل وتعتيم حواف الإطار عند التحريك',
    category: 'الإضاءة والعمق',
    description: 'يولد ظلالاً داخلية تفاعلية (Dynamic Inset Box-Shadow) تزداد كثافتها وعمقها بحسب المسافة وسحب المساحة لتقليد الوصول لحدود لوح السبورة.',
    badge: 'Dynamic Inset Shadow',
    icon: SunMedium,
    visualHint: 'تدرج ظل أسود عميق في الأطراف يتفاعل مع سحب المساحة (Pan)',
  },
  {
    key: 'dustGrain',
    name: 'تدرج مسحات غبار الطبشور عند التحريك',
    category: 'الخلفية والتفاعل',
    description: 'تدرجات خطية متقاطعة تحاكي مسحات مساحات الطبشور وحبيبات البودرة الناعمة، مع دوران وانزلاق الزوايا ديناميكياً أثناء التحريك في الفضاء.',
    badge: 'Linear Dust Transition',
    icon: Wind,
    visualHint: 'مسحات بيضاء خفيفة وخطوط غبار تتحرك بنعومة مع سحب الشاشة',
  },
  {
    key: 'gritNoise',
    name: 'خشونة وضوضاء الحجر الفحمي (SVG Grit)',
    category: 'الملمس الصخري',
    description: 'طبقة حبيبية ميكروسكوبية مستندة إلى فلتر الضوضاء الفركتلي (SVG Fractal Noise) بتأثير مزج تراكبي لإعطاء سطح السبورة عمقاً وملمساً حقيقياً.',
    badge: 'SVG Fractal Filter',
    icon: Layers,
    visualHint: 'ملمس رملي/صخري ناعم يملأ سطح لوح السبورة',
  },
  {
    key: 'depthOfField',
    name: 'عمق الميدان والضبابية عند التقريب (Zoom Blur)',
    category: 'الكاميرا والعدسة',
    description: 'يضيف تأثيراً ضبابياً بصرياً ذكياً على طبقات الخلفية وعناصر الغبار كلما قمت بتقريب المشهد (Zoom-in) لتركيز عين المشاهد على الكتابات والمهام.',
    badge: 'Depth of Field Blur',
    icon: Eye,
    visualHint: 'ضبابية ناعمة على الخلفية تزداد عند التكبير فوق 100%',
  },
];

export const EffectsModal: React.FC<EffectsModalProps> = ({
  isOpen,
  onClose,
  effects,
  onToggleEffect,
  onSetAllEffects,
  onResetEffects,
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

  const activeEffectsCount = Object.values(effects).filter(Boolean).length;
  const totalEffectsCount = EFFECTS_CONFIG.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md transition-opacity duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-neutral-950/95 border border-white/20 rounded-3xl p-5 sm:p-7 shadow-2xl text-white flex flex-col gap-6 max-h-[92vh] overflow-y-auto"
        style={{
          boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 25px 60px rgba(0,0,0,0.9)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  إدارة والتحكم في تأثيرات السبورة
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold">
                  {activeEffectsCount} / {totalEffectsCount} مفعّل
                </span>
              </div>
              <p className="text-xs text-white/60 mt-0.5">
                يمكنك تخصيص وتفعيل أو إخفاء أي من التأثيرات البصرية والواقعية للسبورة بسهولة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="إغلاق (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center justify-between gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl flex-wrap">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-semibold text-white/90">
              إجراءات سريعة:
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                onSetAllEffects(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تفعيل الكل</span>
            </button>

            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                onSetAllEffects(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white/70 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>تعطيل الكل</span>
            </button>

            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                onResetEffects();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/20 text-amber-300 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="إعادة ضبط التأثيرات إلى الحالة الافتراضية"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>الافتراضي</span>
            </button>
          </div>
        </div>

        {/* List of Individual Effects with Toggles */}
        <div className="flex flex-col gap-3">
          {EFFECTS_CONFIG.map((item) => {
            const isEnabled = !!effects[item.key];
            const Icon = item.icon;

            return (
              <div
                key={item.key}
                onClick={() => {
                  chalkSounds.playTap();
                  onToggleEffect(item.key);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 relative group select-none ${
                  isEnabled
                    ? 'bg-white/[0.07] border-amber-400/50 hover:bg-white/[0.1] shadow-lg ring-1 ring-amber-400/30'
                    : 'bg-black/40 border-white/10 hover:border-white/25 hover:bg-white/[0.03] opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`p-2.5 rounded-xl border mt-0.5 shrink-0 transition-colors ${
                        isEnabled
                          ? 'bg-amber-400/20 border-amber-400/50 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                          : 'bg-white/5 border-white/10 text-white/40'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white tracking-wide">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/60 border border-white/10">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-300/80 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
                        <span>{item.visualHint}</span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex flex-col items-center gap-1 shrink-0 mr-1">
                    <div
                      className={`w-12 h-6 rounded-full transition-colors duration-200 relative p-0.5 flex items-center ${
                        isEnabled ? 'bg-amber-400' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-neutral-900 shadow-md transform transition-transform duration-200 flex items-center justify-center ${
                          isEnabled ? '-translate-x-6' : 'translate-x-0'
                        }`}
                      >
                        {isEnabled && <Check className="w-3 h-3 text-amber-400 stroke-[3]" />}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold ${
                        isEnabled ? 'text-amber-400' : 'text-white/40'
                      }`}
                    >
                      {isEnabled ? 'مفعّل' : 'معطّل'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/50 flex-wrap gap-2">
          <span>يتم تطبيق وحفظ كافة التغييرات على الفور في متصفحك.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
