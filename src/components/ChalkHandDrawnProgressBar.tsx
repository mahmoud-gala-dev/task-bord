import React, { useMemo } from 'react';
import { ChalkColor, FontChoice } from '../types';
import { CHALK_PALETTE } from '../utils/themes';
import { getHandwritingFontClass } from '../utils/fonts';

interface ChalkHandDrawnProgressBarProps {
  progressPercent: number; // 0 to 100
  color: ChalkColor;
  fontChoice: FontChoice;
  height?: number; // default ~42px
  showMilestones?: boolean;
  onMilestoneClick?: (milestone: number) => void;
  completedMilestones?: Set<number>;
  label?: string;
}

export const ChalkHandDrawnProgressBar: React.FC<ChalkHandDrawnProgressBarProps> = ({
  progressPercent,
  color,
  fontChoice,
  height = 42,
  showMilestones = true,
  onMilestoneClick,
  completedMilestones = new Set(),
  label,
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progressPercent));
  const colorObj = CHALK_PALETTE[color] || CHALK_PALETTE.yellow;
  const fontClass = getHandwritingFontClass(fontChoice, 'md');

  // معالم الإشعارات المطلوبة
  const milestones = [25, 50, 75, 100];

  // أرقام عشوائية ثابتة لمظهر الرسم اليدوي المتعرج
  const jitterData = useMemo(() => {
    return {
      t1: 1.5,
      t2: -1.2,
      t3: 1.8,
      b1: -1.4,
      b2: 1.6,
      b3: -1.1,
      l1: 1.2,
      r1: -1.3,
    };
  }, []);

  return (
    <div className="w-full flex flex-col gap-2 select-none" dir="rtl">
      {/* Label and Percentage Header */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className={`text-white/80 font-bold ${fontClass} flex items-center gap-1.5`}>
          <span>{label || 'التقدم في جلسة التركيز:'}</span>
          {clampedProgress >= 100 ? (
            <span className="text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/40 text-[11px] animate-pulse">
              🏆 مكتمل 100%
            </span>
          ) : clampedProgress >= 75 ? (
            <span className="text-cyan-300 font-medium text-[11px]">مرحلة الختام 🚀</span>
          ) : clampedProgress >= 50 ? (
            <span className="text-yellow-300 font-medium text-[11px]">منتصف الجلسة ⚡</span>
          ) : clampedProgress >= 25 ? (
            <span className="text-pink-300 font-medium text-[11px]">بداية قوية 🎯</span>
          ) : (
            <span className="text-white/40 text-[11px]">انطلاق ⏳</span>
          )}
        </span>

        <span
          className={`font-mono text-base font-bold ${colorObj.textClass} ${colorObj.glowClass}`}
        >
          {Math.round(clampedProgress)}%
        </span>
      </div>

      {/* Hand-Drawn Chalk Progress Bar Container */}
      <div className="relative w-full overflow-visible" style={{ height: `${height}px` }}>
        {/* SVG Hand-Sketched Chalk Frame & Hatching */}
        <svg
          className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
          preserveAspectRatio="none"
          viewBox="0 0 100 40"
        >
          <defs>
            {/* فلتر تشتت وخشونة الطبشور على الإطار */}
            <filter id="chalkBarRough" x="-5%" y="-10%" width="110%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" />
            </filter>

            {/* نقش الخطوط الطبشورية المائلة (Chalk Hatching Texture) */}
            <pattern id="chalkHatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="6" stroke={colorObj.colorHex} strokeWidth="1.8" opacity="0.45" />
            </pattern>
          </defs>

          {/* خلفية شبه شفافة داكنة كسطح السبورة داخل الإطار */}
          <rect
            x="1.5"
            y="3"
            width="97"
            height="34"
            fill="rgba(0, 0, 0, 0.45)"
            rx="3"
          />

          {/* Progress Fill (Hand-drawn Chalk Scribble / Hatch) */}
          {clampedProgress > 0 && (
            <g>
              {/* Fill Base Gradient */}
              <rect
                x="2.5"
                y="4.5"
                width={Math.max(0, clampedProgress * 0.95)}
                height="31"
                fill={colorObj.colorHex}
                opacity="0.22"
                rx="2"
              />
              {/* Fill Diagonal Chalk Hatching */}
              <rect
                x="2.5"
                y="4.5"
                width={Math.max(0, clampedProgress * 0.95)}
                height="31"
                fill="url(#chalkHatch)"
                rx="2"
              />
              {/* Top and Bottom Inner Glow lines */}
              <line
                x1="3"
                y1="5.5"
                x2={Math.max(3, clampedProgress * 0.95)}
                y2="5.5"
                stroke={colorObj.colorHex}
                strokeWidth="1.2"
                opacity="0.8"
                strokeDasharray="4 2"
              />
              <line
                x1="3"
                y1="34.5"
                x2={Math.max(3, clampedProgress * 0.95)}
                y2="34.5"
                stroke={colorObj.colorHex}
                strokeWidth="1.2"
                opacity="0.6"
                strokeDasharray="4 2"
              />
            </g>
          )}

          {/* Outer Hand-drawn Sketched Frame (الأضلاع الأربعة بتموجات يد رسام الطبشور) */}
          <path
            d={`
              M 0.5 4 Q 50 ${2.5 + jitterData.t2} 99.5 3.5
              Q ${100.5 + jitterData.r1} 20 99.5 36.5
              Q 50 ${37.5 + jitterData.b2} 0.5 36.5
              Q ${-0.5 + jitterData.l1} 20 0.5 4
            `}
            fill="none"
            stroke={colorObj.colorHex}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#chalkBarRough)"
            opacity="0.95"
          />

          {/* Overlapping Sketched Corner Tails (زوائد الزوايا المرسومة باليد) */}
          <g stroke={colorObj.colorHex} strokeWidth="1.6" opacity="0.8" strokeLinecap="round">
            {/* Top-Right */}
            <line x1="94" y1="3" x2="101.5" y2="3.2" />
            <line x1="99" y1="0.5" x2="99.2" y2="9" />
            {/* Top-Left */}
            <line x1="-1.5" y1="3.8" x2="6" y2="4" />
            <line x1="1" y1="0.5" x2="0.8" y2="9" />
            {/* Bottom-Right */}
            <line x1="94" y1="36.5" x2="101.5" y2="36.8" />
            <line x1="99" y1="32" x2="99.2" y2="39.5" />
            {/* Bottom-Left */}
            <line x1="-1.5" y1="36.2" x2="6" y2="36" />
            <line x1="1" y1="32" x2="0.8" y2="39.5" />
          </g>

          {/* Second loose sketch outline pass (ضربة طبشور تكرارية خفيفة) */}
          <path
            d={`
              M 2 5 Q 50 4 98 4.5
              Q 99 20 98 35.5
              Q 50 36 2 35.5
              Q 1 20 2 5
            `}
            fill="none"
            stroke={colorObj.colorHex}
            strokeWidth="1.2"
            strokeDasharray="12 4"
            opacity="0.4"
          />

          {/* Vertical Chalk Milestone Divider Ticks inside the bar (25%, 50%, 75%) */}
          {showMilestones &&
            [25, 50, 75].map((m) => {
              const isPast = clampedProgress >= m;
              return (
                <line
                  key={m}
                  x1={`${m}`}
                  y1="5"
                  x2={`${m}`}
                  y2="35"
                  stroke={isPast ? colorObj.colorHex : 'rgba(255, 255, 255, 0.35)'}
                  strokeWidth={isPast ? '1.8' : '1.2'}
                  strokeDasharray={isPast ? 'none' : '3 2'}
                  opacity={isPast ? 0.9 : 0.4}
                />
              );
            })}
        </svg>

        {/* Animated Glowing Chalk Tip Marker at Current Progress Head */}
        {clampedProgress > 1 && clampedProgress < 100 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 z-10"
            style={{
              left: `${clampedProgress}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Chalk tip glowing spark */}
            <div
              className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_10px_white,0_0_18px_currentColor] animate-pulse"
              style={{ color: colorObj.colorHex }}
            />
          </div>
        )}
      </div>

      {/* Milestones Tick Labels: 25% | 50% | 75% | 100% */}
      {showMilestones && (
        <div className="relative w-full flex items-center justify-between px-1 text-[11px] mt-0.5">
          {milestones.map((m) => {
            const isReached = clampedProgress >= m;
            const isFinished = completedMilestones.has(m);

            return (
              <button
                key={m}
                type="button"
                onClick={() => onMilestoneClick && onMilestoneClick(m)}
                title={`مرحلة ${m}% - إشعار Google Chrome وتنبيه صوتي`}
                className={`flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                  isReached
                    ? `${colorObj.textClass} font-bold scale-110 drop-shadow-[0_0_5px_currentColor]`
                    : 'text-white/40 hover:text-white/70'
                }`}
                style={{
                  position: 'absolute',
                  left: `${m}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                {/* Hand-sketched tick marker circle */}
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] transition-transform ${
                    isReached
                      ? 'border-current bg-white/20 scale-110'
                      : 'border-white/30 bg-black/40'
                  }`}
                >
                  {isReached ? '✓' : ''}
                </div>
                <span className={`font-mono text-[10px] ${fontClass}`}>
                  {m}%
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
