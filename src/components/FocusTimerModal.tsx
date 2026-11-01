import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Bell, 
  BellOff, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Target, 
  Volume2, 
  VolumeX, 
  Minimize2, 
  Maximize2,
  Check
} from 'lucide-react';
import { TaskItem, ChalkColor, FontChoice } from '../types';
import { CHALK_PALETTE } from '../utils/themes';
import { getHandwritingFontClass } from '../utils/fonts';
import { chalkSounds } from '../utils/audio';
import { ChalkHandDrawnProgressBar } from './ChalkHandDrawnProgressBar';
import { 
  getBrowserNotificationState, 
  requestChromeNotificationPermission, 
  sendChromeNotification, 
  updateChromeTabTitle, 
  MILESTONE_NOTIFICATIONS 
} from '../utils/notifications';

export interface FocusTimerState {
  isActive: boolean;
  totalDurationSeconds: number; // e.g. 25 * 60
  remainingSeconds: number;
  linkedTaskId?: string;
  customGoalText?: string;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  triggeredMilestones: number[]; // [25, 50, 75, 100]
}

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardTasks: TaskItem[];
  currentColor: ChalkColor;
  fontChoice: FontChoice;
  onMarkTaskCompleted?: (taskId: string) => void;
  // Controlled timer state passed from parent so it persists across views
  timerState: FocusTimerState;
  onUpdateTimerState: (updates: Partial<FocusTimerState> | ((prev: FocusTimerState) => FocusTimerState)) => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  isOpen,
  onClose,
  boardTasks,
  currentColor,
  fontChoice,
  onMarkTaskCompleted,
  timerState,
  onUpdateTimerState,
  isMinimized,
  onToggleMinimize,
}) => {
  const {
    isActive,
    totalDurationSeconds,
    remainingSeconds,
    linkedTaskId,
    customGoalText,
    notificationsEnabled,
    soundEnabled,
    triggeredMilestones,
  } = timerState;

  const [customMinutesInput, setCustomMinutesInput] = useState<string>('25');
  const [permissionState, setPermissionState] = useState(getBrowserNotificationState());
  const [completionBanner, setCompletionBanner] = useState<string | null>(null);

  const colorObj = CHALK_PALETTE[currentColor] || CHALK_PALETTE.yellow;
  const fontClass = getHandwritingFontClass(fontChoice, 'lg');

  // حساب النسبة المئوية للوقت المنقضي: 0% عند البداية إلى 100% عند النهاية
  const elapsedSeconds = Math.max(0, totalDurationSeconds - remainingSeconds);
  const progressPercent = totalDurationSeconds > 0 
    ? Math.min(100, Math.max(0, (elapsedSeconds / totalDurationSeconds) * 100))
    : 0;

  // فحص إذن إشعارات المتصفح
  useEffect(() => {
    setPermissionState(getBrowserNotificationState());
  }, [isOpen]);

  // طلب تفعيل إشعارات كروم
  const handleRequestChromePermission = async () => {
    chalkSounds.playTap();
    const granted = await requestChromeNotificationPermission();
    setPermissionState(getBrowserNotificationState());
    if (granted) {
      onUpdateTimerState({ notificationsEnabled: true });
      sendChromeNotification('تم تفعيل إشعارات Google Chrome بنجاح 🔔', 'ستصلك تنبيهات تلقائية عند 25%، 50%، 75%، وعند انتهاء الجلسة!');
    }
  };

  // تبديل حالة المؤقت (بدء / إيقاف مؤقت)
  const handleTogglePlay = () => {
    if (isActive) {
      chalkSounds.playTap();
      onUpdateTimerState({ isActive: false });
      updateChromeTabTitle(); // استرجاع العنوان الأصلي
    } else {
      chalkSounds.playChalkStroke();
      // إذا كان الوقت منتهياً بالفعل، أعد ضبطه من البداية
      if (remainingSeconds <= 0) {
        onUpdateTimerState({
          remainingSeconds: totalDurationSeconds,
          triggeredMilestones: [],
          isActive: true,
        });
      } else {
        onUpdateTimerState({ isActive: true });
      }
    }
  };

  // إعادة ضبط المؤقت
  const handleReset = () => {
    chalkSounds.playErase();
    onUpdateTimerState({
      isActive: false,
      remainingSeconds: totalDurationSeconds,
      triggeredMilestones: [],
    });
    updateChromeTabTitle();
    setCompletionBanner(null);
  };

  // اختيار مدة جاهزة (15، 25، 45، 60، 90 دقيقة)
  const handleSelectPreset = (minutes: number) => {
    chalkSounds.playTap();
    const secs = minutes * 60;
    setCustomMinutesInput(String(minutes));
    onUpdateTimerState({
      isActive: false,
      totalDurationSeconds: secs,
      remainingSeconds: secs,
      triggeredMilestones: [],
    });
    updateChromeTabTitle();
    setCompletionBanner(null);
  };

  // تطبيق مدة مخصصة
  const handleApplyCustomMinutes = () => {
    const mins = parseInt(customMinutesInput, 10);
    if (!isNaN(mins) && mins > 0 && mins <= 240) {
      handleSelectPreset(mins);
    }
  };

  // فحص إشعارات المراحل 25% - 50% - 75% - 100%
  useEffect(() => {
    if (!isActive || totalDurationSeconds <= 0) return;

    const milestones = [25, 50, 75, 100];
    milestones.forEach((m) => {
      if (progressPercent >= m && !triggeredMilestones.includes(m)) {
        // تسجيل المرحلة حتى لا تتكرر
        onUpdateTimerState((prev) => ({
          ...prev,
          triggeredMilestones: [...prev.triggeredMilestones, m],
        }));

        const info = MILESTONE_NOTIFICATIONS[m];
        if (info) {
          // 1. صوت التنبيه
          if (soundEnabled) {
            if (m === 100) {
              chalkSounds.playCompletion();
            } else {
              chalkSounds.playMilestone(m);
            }
          }

          // 2. إشعار Google Chrome
          if (notificationsEnabled) {
            sendChromeNotification(info.title, info.body);
          }

          // 3. رسالة داخل التطبيق
          setCompletionBanner(`${info.title} - ${info.body}`);
        }
      }
    });
  }, [progressPercent, isActive, totalDurationSeconds, triggeredMilestones, soundEnabled, notificationsEnabled, onUpdateTimerState]);

  // تحديث عنوان تبويب كروم أثناء عمل المؤقت
  useEffect(() => {
    if (isActive && remainingSeconds > 0) {
      const mins = Math.floor(remainingSeconds / 60);
      const secs = remainingSeconds % 60;
      const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      const taskName = boardTasks.find((t) => t.id === linkedTaskId)?.name || customGoalText || 'جلسة تركيز';
      updateChromeTabTitle(`(${formatted}) ⏳ ${taskName}`);
    }
  }, [isActive, remainingSeconds, linkedTaskId, customGoalText, boardTasks]);

  // تحويل الثواني إلى دقائق وثواني مصفوفة
  const displayMinutes = Math.floor(remainingSeconds / 60);
  const displaySeconds = remainingSeconds % 60;
  const timeFormatted = `${String(displayMinutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`;

  const linkedTask = boardTasks.find((t) => t.id === linkedTaskId);

  // إغلاق النافذة
  const handleClose = () => {
    chalkSounds.playTap();
    onClose();
  };

  if (!isOpen && !isMinimized) return null;

  // إذا كانت النافذة مصغرة كشعار طافي في الزاوية
  if (isMinimized) {
    return (
      <div 
        data-focus-widget="true"
        onClick={() => {
          chalkSounds.playTap();
          onToggleMinimize();
        }}
        title="انقر لتوسيع أداة وقت التركيز"
        className="fixed bottom-12 right-6 z-50 flex items-center gap-2.5 bg-black/85 border border-amber-400/50 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-2xl text-white cursor-pointer hover:scale-105 active:scale-95 transition-all select-none animate-fade-in group"
        dir="rtl"
      >
        <div className="relative flex items-center justify-center">
          <Clock className={`w-5 h-5 text-amber-300 ${isActive ? 'animate-spin-slow' : ''}`} />
          {isActive && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          )}
        </div>

        <div className="flex flex-col text-right">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-base font-bold text-amber-300">
              {timeFormatted}
            </span>
            <span className="text-[10px] text-white/50 font-bold font-mono">
              ({Math.round(progressPercent)}%)
            </span>
          </div>
          <span className="text-[10px] text-white/70 max-w-[120px] truncate">
            {linkedTask ? linkedTask.name : customGoalText || 'جلسة تركيز'}
          </span>
        </div>

        <div className="p-1 rounded-lg bg-white/10 group-hover:bg-white/20 text-white/70">
          <Maximize2 className="w-3.5 h-3.5" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md select-none animate-fade-in pointer-events-auto"
      dir="rtl"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="relative w-full max-w-lg bg-neutral-900/95 border border-white/25 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex flex-col gap-5 text-white animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col text-right">
              <h3 className={`text-lg font-bold text-white tracking-wide ${fontClass}`}>
                أداة وقت التركيز وإشعارات كروم ⏱️
              </h3>
              <span className="text-[11px] text-white/50">
                تنبيهات تلقائية في كروم عند 25%، 50%، 75%، وعند النهاية
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* زر التصغير لشعار طافي */}
            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                onToggleMinimize();
              }}
              title="تصغير كشعار طافي جانبي للمتابعة أثناء العمل"
              className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Minimize2 className="w-4 h-4" />
            </button>

            {/* إغلاق */}
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Milestone Trigger Notification Banner Toast */}
        {completionBanner && (
          <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-emerald-500/20 border border-amber-400/40 p-2.5 rounded-2xl text-xs text-amber-200 animate-bounce">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{completionBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setCompletionBanner(null)}
              className="p-1 hover:bg-white/10 rounded-full text-white/60"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Focus Goal & Linked Task Selector */}
        <div className="flex flex-col gap-1.5 bg-black/40 border border-white/10 rounded-2xl p-3">
          <label className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-300" />
            <span>المهمة أو الهدف محل التركيز:</span>
          </label>
          <div className="flex items-center gap-2">
            <select
              value={linkedTaskId || ''}
              onChange={(e) => {
                chalkSounds.playTap();
                const tid = e.target.value;
                onUpdateTimerState({
                  linkedTaskId: tid || undefined,
                  customGoalText: tid ? undefined : timerState.customGoalText,
                });
              }}
              className="flex-1 bg-neutral-800 border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer hover:border-amber-400/50 transition-colors"
            >
              <option value="">🎯 هدف تركيز حر وعام</option>
              {boardTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.completed ? '✓ ' : ''}{t.icon ? `${t.icon} ` : ''}{t.name}
                </option>
              ))}
            </select>

            {!linkedTaskId && (
              <input
                type="text"
                value={customGoalText || ''}
                onChange={(e) => onUpdateTimerState({ customGoalText: e.target.value })}
                placeholder="اكتب الهدف (مثل: إنهاء التقرير)"
                className="flex-1 bg-neutral-800 border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400 transition-colors"
              />
            )}
          </div>
        </div>

        {/* Big Chalkboard Countdown Timer Display */}
        <div className="flex flex-col items-center justify-center py-2 relative">
          <div className="relative flex flex-col items-center justify-center">
            {/* Glowing Digital Chalk Typography */}
            <span
              className={`font-mono text-6xl sm:text-7xl font-bold tracking-widest ${colorObj.textClass} ${colorObj.glowClass}`}
              style={{ textShadow: `0 0 15px ${colorObj.colorHex}, 0 0 35px ${colorObj.colorHex}` }}
            >
              {timeFormatted}
            </span>
            <span className={`text-xs text-white/50 mt-1 font-medium ${fontClass}`}>
              {isActive ? '⏳ جلسة التركيز قيد التشغيل...' : remainingSeconds <= 0 ? '🏆 اكتملت الجلسة بنجاح!' : 'جاهز للانطلاق'}
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap">
            {[15, 25, 45, 60, 90].map((mins) => {
              const isSelected = totalDurationSeconds === mins * 60;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleSelectPreset(mins)}
                  disabled={isActive}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-black shadow-md scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-white/80 disabled:opacity-40'
                  }`}
                >
                  {mins} د
                </button>
              );
            })}

            {/* Custom Minutes Input */}
            <div className="flex items-center gap-1 bg-white/10 rounded-xl px-2 py-1 mr-1">
              <input
                type="number"
                min="1"
                max="240"
                value={customMinutesInput}
                disabled={isActive}
                onChange={(e) => setCustomMinutesInput(e.target.value)}
                onBlur={handleApplyCustomMinutes}
                className="w-10 bg-transparent text-center text-xs font-mono font-bold outline-none text-white disabled:opacity-40"
              />
              <span className="text-[10px] text-white/50">د</span>
            </div>
          </div>
        </div>

        {/* Hand-Drawn Chalk Progress Bar with 25%, 50%, 75%, 100% Milestones */}
        <div className="w-full">
          <ChalkHandDrawnProgressBar
            progressPercent={progressPercent}
            color={currentColor}
            fontChoice={fontChoice}
            height={42}
            completedMilestones={new Set(triggeredMilestones)}
            label="مسار إنجاز الوقت (مرسوم بالطبشور):"
          />
        </div>

        {/* Controls: Play/Pause, Reset, Mark Completed */}
        <div className="flex items-center justify-center gap-3 pt-1">
          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            title="إعادة ضبط المؤقت للبداية"
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Play / Pause Main Action */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              isActive
                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/25'
                : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/25'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{remainingSeconds <= 0 ? 'بدء جلسة جديدة' : 'بدء التركيز'}</span>
              </>
            )}
          </button>

          {/* Mark Task Completed if linked */}
          {linkedTask && !linkedTask.completed && onMarkTaskCompleted && (
            <button
              type="button"
              onClick={() => {
                chalkSounds.playChalkStroke();
                onMarkTaskCompleted(linkedTask.id);
              }}
              title="تحديد المهمة كمنجزة على الصبورة"
              className="p-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Check className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Notifications & Sound Settings Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/70 flex-wrap gap-2">
          {/* Chrome Notification Status / Request */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRequestChromePermission}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer text-xs ${
                permissionState === 'granted'
                  ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                  : 'bg-amber-500/15 border-amber-400/40 text-amber-300 hover:bg-amber-500/25'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>
                {permissionState === 'granted'
                  ? 'إشعارات كروم مفعّلة 🔔'
                  : 'تفعيل إشعارات Google Chrome 🔔'}
              </span>
            </button>

            {/* Toggle Chrome Notifications on/off */}
            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                onUpdateTimerState({ notificationsEnabled: !notificationsEnabled });
              }}
              title="تشغيل أو كتم إشعارات المراحل"
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                notificationsEnabled
                  ? 'bg-white/15 border-white/30 text-white'
                  : 'bg-black/30 border-white/10 text-white/40'
              }`}
            >
              {notificationsEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Acoustic Chimes Sound Toggle */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                onUpdateTimerState({ soundEnabled: !soundEnabled });
              }}
              title="تشغيل أو كتم رنين التنبيه الصوتي"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-black/30 border-white/10 text-white/40'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>تنبيهات صوتية</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
