import React, { useState, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  Image as ImageIcon, 
  Download, 
  Check, 
  Sliders, 
  Layers, 
  RotateCcw, 
  Dices,
  Eye
} from 'lucide-react';
import { 
  CHALK_BACKGROUND_PRESETS, 
  BackgroundPreset, 
  CustomBackgroundConfig, 
  DEFAULT_BG_CONFIG, 
  generateCustomBoardTexture,
  exportBackgroundAsPng
} from '../utils/backgroundTextures';
import { chalkSounds } from '../utils/audio';

interface BoardBackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBoardTitle: string;
  currentCustomBgUrl?: string;
  currentPresetId?: string;
  onApplyBackground: (dataUrl: string, presetId?: string, applyToAll?: boolean) => void;
  onResetBackground: () => void;
}

export const BoardBackgroundModal: React.FC<BoardBackgroundModalProps> = ({
  isOpen,
  onClose,
  activeBoardTitle,
  currentCustomBgUrl,
  currentPresetId,
  onApplyBackground,
  onResetBackground,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    currentPresetId || CHALK_BACKGROUND_PRESETS[0].id
  );
  const [customConfig, setCustomConfig] = useState<CustomBackgroundConfig>(DEFAULT_BG_CONFIG);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null);

  // Computed data URL for preview
  const previewDataUrl = useMemo(() => {
    if (activeTab === 'presets') {
      const preset = CHALK_BACKGROUND_PRESETS.find((p) => p.id === selectedPresetId);
      if (preset) {
        return preset.getDataUrl(1, 0.5);
      }
      return CHALK_BACKGROUND_PRESETS[0].getDataUrl();
    } else {
      return generateCustomBoardTexture(customConfig);
    }
  }, [activeTab, selectedPresetId, customConfig]);

  if (!isOpen) return null;

  const handleApplyToCurrent = () => {
    chalkSounds.playChalkStroke();
    const presetId = activeTab === 'presets' ? selectedPresetId : 'custom';
    onApplyBackground(previewDataUrl, presetId, false);
    setApplySuccessMsg('تم تعيين الخلفية للسبورة الحالية بنجاح ✨');
    setTimeout(() => {
      setApplySuccessMsg(null);
      onClose();
    }, 900);
  };

  const handleApplyToAll = () => {
    chalkSounds.playChalkStroke();
    const presetId = activeTab === 'presets' ? selectedPresetId : 'custom';
    onApplyBackground(previewDataUrl, presetId, true);
    setApplySuccessMsg('تم تعيين الخلفية لجميع السبورات بنجاح 📌');
    setTimeout(() => {
      setApplySuccessMsg(null);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    chalkSounds.playErase();
    onResetBackground();
    setApplySuccessMsg('تمت استعادة الخلفية الافتراضية للسبورة ↩️');
    setTimeout(() => {
      setApplySuccessMsg(null);
      onClose();
    }, 800);
  };

  const handleExportPng = async () => {
    chalkSounds.playTap();
    setIsExporting(true);
    try {
      const name = activeTab === 'presets' 
        ? `chalkboard-${selectedPresetId}.png`
        : `chalkboard-custom-${customConfig.baseType}.png`;
      await exportBackgroundAsPng(previewDataUrl, name);
    } catch (e) {
      console.error('Export PNG failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRandomize = () => {
    chalkSounds.playTap();
    const types: CustomBackgroundConfig['baseType'][] = [
      'vintage-wood', 'classroom-slate', 'black-slate', 'antique-mahogany', 'rustic-pine', 'blueprint-navy'
    ];
    const randType = types[Math.floor(Math.random() * types.length)];
    const isSlate = randType === 'classroom-slate' || randType === 'black-slate' || randType === 'blueprint-navy';

    setCustomConfig({
      baseType: randType,
      planksCount: isSlate ? (Math.random() > 0.6 ? 2 : 0) : Math.floor(Math.random() * 4) + 2,
      grainIntensity: Number((0.6 + Math.random() * 1.0).toFixed(2)),
      chalkDustHaze: Number((0.3 + Math.random() * 0.6).toFixed(2)),
      woodFrame: Math.random() > 0.3,
      vignetteIntensity: Number((0.4 + Math.random() * 0.45).toFixed(2)),
      warmth: Number((0.2 + Math.random() * 0.7).toFixed(2)),
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md transition-opacity duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#141210] border border-amber-900/40 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden text-neutral-100 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-amber-950/40 via-stone-900/50 to-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-md">
              <ImageIcon className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>توليد وتخصيص خلفيات السبورة والألواح الخشبية</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-normal">
                  ألواح معتقة وسبورات مدرسية 🪵
                </span>
              </h2>
              <p className="text-xs text-white/50">
                خصص خلفية سبورة &quot;{activeBoardTitle}&quot; بألواح خشب البلوط، الماهوجني، أو حجر الأردواز الكلاسيكي
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-5">
          {/* Success Banner */}
          {applySuccessMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-sm font-bold flex items-center justify-center gap-2 shadow-lg animate-fade-in">
              <Check className="w-4 h-4 text-emerald-300" />
              <span>{applySuccessMsg}</span>
            </div>
          )}

          {/* Real-time Visual Preview Window */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-300" />
                معاينة حية لشكل السبورة ونصوص الطبشور على هذا اللوح:
              </span>
              <div className="flex items-center gap-2">
                {currentCustomBgUrl && (
                  <span className="text-[11px] px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    السبورة تحتوي حالياً على خلفية مخصصة
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleExportPng}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-white/80 hover:text-white transition-all cursor-pointer"
                  title="تنزيل الخلفية الحالية بدقة Full HD (1920x1080) كصورة PNG"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isExporting ? 'جاري التحميل...' : 'تنزيل كـ HD PNG'}</span>
                </button>
              </div>
            </div>

            {/* Preview Display Container */}
            <div 
              className="relative w-full h-44 sm:h-56 rounded-2xl border-2 border-amber-900/50 overflow-hidden shadow-2xl flex flex-col justify-between p-4 group select-none"
              style={{
                backgroundImage: `url("${previewDataUrl}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Sample Chalk Writings inside Preview to test readability */}
              <div className="relative z-10 flex flex-col gap-1.5 max-w-sm pointer-events-none">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-black/40 border border-white/20 backdrop-blur-sm self-start">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-handwriting-ruqaa text-white text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    سبورة المهام والتخطيط ✍️
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-dashed border-amber-300/40 backdrop-blur-sm self-start">
                  <span className="font-handwriting-katibeh text-yellow-200 text-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    ✓ إنجاز الخريطة الذهنية والأفكار التراثية
                  </span>
                </div>
              </div>

              {/* Bottom watermark badge inside preview */}
              <div className="relative z-10 flex items-center justify-between text-[11px] text-white/70 bg-black/50 px-3 py-1 rounded-xl border border-white/15 backdrop-blur-md self-stretch pointer-events-none">
                <span className="font-medium">
                  {activeTab === 'presets' 
                    ? CHALK_BACKGROUND_PRESETS.find((p) => p.id === selectedPresetId)?.name 
                    : `لوح مخصص (${customConfig.baseType}) - ${customConfig.planksCount} ألواح`}
                </span>
                <span className="text-white/40">16:9 • نسيج عالي الجودة</span>
              </div>
            </div>
          </div>

          {/* Mode Switcher: Presets vs Custom Studio */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                setActiveTab('presets');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'presets'
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                  : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
              }`}
            >
              <Layers className="w-4 h-4 stroke-[2.5]" />
              <span>نماذج وقوالب كلاسيكية جاهزة ({CHALK_BACKGROUND_PRESETS.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                setActiveTab('custom');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'custom'
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                  : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
              }`}
            >
              <Sliders className="w-4 h-4 stroke-[2.5]" />
              <span>استوديو التوليد المخصص 🎛️</span>
            </button>
          </div>

          {/* TAB 1: Ready Presets Grid */}
          {activeTab === 'presets' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CHALK_BACKGROUND_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      chalkSounds.playTap();
                      setSelectedPresetId(preset.id);
                    }}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden group ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/40 bg-amber-500/10 scale-[1.01]'
                        : 'border-white/10 hover:border-white/30 bg-white/[0.03] hover:bg-white/[0.06]'
                    }`}
                  >
                    {/* Thumbnail Mini Preview */}
                    <div 
                      className="w-full h-20 rounded-xl border border-white/10 overflow-hidden relative shadow-inner"
                      style={{ background: preset.previewThumbnail }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                        <span className="text-[11px] font-bold text-white drop-shadow">
                          {preset.name}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold text-xs shadow-md">
                          ✓
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-white/60 leading-relaxed min-h-[36px]">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: Custom Generator Studio */}
          {activeTab === 'custom' && (
            <div className="flex flex-col gap-4 bg-white/[0.02] border border-white/10 p-4 sm:p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  تعديل خصائص اللوح والتوليد المباشر:
                </span>
                <button
                  type="button"
                  onClick={handleRandomize}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 text-xs font-bold transition-all cursor-pointer"
                  title="توليد مزيج عشوائي مميز من الألواح والخصائص"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>توليد عشوائي 🎲</span>
                </button>
              </div>

              {/* Base Surface Type Picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/80 font-medium">نوع ومادة السطح الأساسية:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'vintage-wood', label: 'ألواح خشب البلوط 🪵' },
                    { id: 'classroom-slate', label: 'سبورة مدرسية زمردية 🏫' },
                    { id: 'black-slate', label: 'حجر أردواز بركاني 🌋' },
                    { id: 'antique-mahogany', label: 'خشب الماهوجني الملكي 🏛️' },
                    { id: 'rustic-pine', label: 'خشب صنوبر ريفي 🌲' },
                    { id: 'blueprint-navy', label: 'كحلي ومخططات فلكية 📐' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        chalkSounds.playTap();
                        setCustomConfig({
                          ...customConfig,
                          baseType: item.id as CustomBackgroundConfig['baseType'],
                        });
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        customConfig.baseType === item.id
                          ? 'bg-amber-400 text-black border-amber-300 shadow-md scale-102'
                          : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                {/* Planks Count Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/80">عدد فواصل الألواح الخشبية:</span>
                    <span className="font-mono text-amber-300">{customConfig.planksCount} ألوح</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    step="1"
                    value={customConfig.planksCount}
                    onChange={(e) => setCustomConfig({ ...customConfig, planksCount: parseInt(e.target.value, 10) })}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <span className="text-[10px] text-white/40">0 = لوح ناعم متصل بدون فواصل</span>
                </div>

                {/* Grain Intensity Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/80">كثافة عروق وتفاصيل الخشب:</span>
                    <span className="font-mono text-amber-300">{Math.round(customConfig.grainIntensity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="2.0"
                    step="0.1"
                    value={customConfig.grainIntensity}
                    onChange={(e) => setCustomConfig({ ...customConfig, grainIntensity: parseFloat(e.target.value) })}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Chalk Dust Haze Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/80">مسحات وبودرة الطبشور القديمة:</span>
                    <span className="font-mono text-amber-300">{Math.round(customConfig.chalkDustHaze * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.05"
                    value={customConfig.chalkDustHaze}
                    onChange={(e) => setCustomConfig({ ...customConfig, chalkDustHaze: parseFloat(e.target.value) })}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Vignette Intensity Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/80">تعتيم الحواف الفينتاج (Vignette):</span>
                    <span className="font-mono text-amber-300">{Math.round(customConfig.vignetteIntensity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="0.95"
                    step="0.05"
                    value={customConfig.vignetteIntensity}
                    onChange={(e) => setCustomConfig({ ...customConfig, vignetteIntensity: parseFloat(e.target.value) })}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Wood Warmth Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/80">دفء ولون الخشب (Warmth):</span>
                    <span className="font-mono text-amber-300">{Math.round(customConfig.warmth * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.05"
                    value={customConfig.warmth}
                    onChange={(e) => setCustomConfig({ ...customConfig, warmth: parseFloat(e.target.value) })}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Wood Frame Toggle */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 self-center">
                  <div className="flex flex-col">
                    <span className="text-xs text-white/90 font-medium">إطار خشبي عريض مع مسامير أثرية</span>
                    <span className="text-[10px] text-white/40">حواف مؤطرة بنقوش وزوايا نحاسية</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      chalkSounds.playTap();
                      setCustomConfig({ ...customConfig, woodFrame: !customConfig.woodFrame });
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      customConfig.woodFrame ? 'bg-amber-400' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                        customConfig.woodFrame ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/10 bg-black/40 flex-wrap sm:flex-nowrap">
          {/* Left: Reset to Default Theme */}
          {currentCustomBgUrl ? (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-300 hover:text-red-200 hover:bg-red-500/15 border border-red-500/30 text-xs font-semibold transition-all cursor-pointer"
              title="إزالة اللوح المخصص والعودة للنمط والتدرج الافتراضي للسبورة"
            >
              <RotateCcw className="w-4 h-4" />
              <span>استعادة الخلفية الافتراضية للسبورة</span>
            </button>
          ) : (
            <div className="text-[11px] text-white/40">
              يمكنك تغيير الخلفية في أي وقت أو استعادتها
            </div>
          )}

          {/* Right: Apply Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handleApplyToAll}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all cursor-pointer hover:scale-102 active:scale-98"
              title="تطبيق هذه الخلفية على جميع السبورات في المشروع"
            >
              <span>تطبيق على الكل 📌</span>
            </button>

            <button
              type="button"
              onClick={handleApplyToCurrent}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-all cursor-pointer shadow-lg shadow-amber-400/20 hover:scale-102 active:scale-98"
              title="تعيين هذه الخلفية للسبورة الحالية"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>تعيين كخلفية للسبورة الحالية 🎨</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
