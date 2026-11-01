import React, { useMemo } from 'react';
import { ChalkColor, XMindBoxStyle } from '../types';

interface ChalkHandDrawnBoxProps {
  nodeId: string;
  width: number;
  height: number;
  colorHex: string;
  glowClass?: string;
  isSelected: boolean;
  isRoot: boolean;
  boxStyle: XMindBoxStyle;
}

// توليد أرقام عشوائية ثابتة بناءً على معرف العقدة لضمان استقرار خطوط الرسم باليد
function pseudoRandom(seed: string, offset: number): number {
  let hash = offset;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const x = Math.sin(hash + offset) * 10000;
  return x - Math.floor(x);
}

export const ChalkHandDrawnBox: React.FC<ChalkHandDrawnBoxProps> = ({
  nodeId,
  width,
  height,
  colorHex,
  isSelected,
  isRoot,
  boxStyle,
}) => {
  // توليد مسار الرسم اليدوي للمربع
  const svgData = useMemo(() => {
    // هوامش أمان للمسار المتعرج
    const pad = 12;
    const w = Math.max(90, width);
    const h = Math.max(40, height);
    const svgW = w + pad * 2;
    const svgH = h + pad * 2;

    const x0 = pad;
    const y0 = pad;
    const x1 = pad + w;
    const y1 = pad + h;

    // تموجات وتعرجات اليد الطبيعية أثناء رسم الطبشور
    const j = (idx: number, scale: number = 3.5) => (pseudoRandom(nodeId, idx) * 2 - 1) * scale;

    if (boxStyle === 'underline') {
      // نمط الخط التحتي اليدوي: خط متموج عريض تحت النص كأنه مكتوب ومسطر بالطبشور
      const lineY = y1 - 4;
      const path1 = `M ${x0 - 4 + j(1, 3)} ${lineY + j(2, 2)} Q ${x0 + w * 0.4 + j(3, 4)} ${lineY - 2 + j(4, 2.5)} ${x1 + 6 + j(5, 3)} ${lineY + 1 + j(6, 2)}`;
      const path2 = `M ${x0 + 6 + j(7, 3)} ${lineY + 3 + j(8, 1.5)} Q ${x0 + w * 0.6 + j(9, 4)} ${lineY + 4 + j(10, 2)} ${x1 - 4 + j(11, 3)} ${lineY + 2.5 + j(12, 1.5)}`;
      
      // أقواس خفيفة على الأطراف
      const bracketLeft = `M ${x0 + 4} ${y0 + 4} C ${x0 - 2} ${y0 + h * 0.5}, ${x0 - 2} ${y1 - 8}, ${x0 + 4} ${y1 - 4}`;
      const bracketRight = `M ${x1 - 4} ${y0 + 4} C ${x1 + 2} ${y0 + h * 0.5}, ${x1 + 2} ${y1 - 8}, ${x1 - 4} ${y1 - 4}`;

      return {
        svgW,
        svgH,
        pad,
        mainPath: `${path1} ${path2}`,
        tailsPath: `${bracketLeft} ${bracketRight}`,
        extraPath: '',
        fillD: `M ${x0} ${y0 + 2} L ${x1} ${y0 + 2} L ${x1} ${y1 - 6} L ${x0} ${y1 - 6} Z`,
      };
    }

    if (boxStyle === 'bracket') {
      // نمط الأقواس المفتوحة [ نص الفكرة ]
      const bl = `M ${x0 + 10} ${y0 + 2} L ${x0 + 2} ${y0 + 3 + j(1, 2)} L ${x0 + 1 + j(2, 2)} ${y1 - 3} L ${x0 + 10} ${y1 - 2}`;
      const br = `M ${x1 - 10} ${y0 + 2} L ${x1 - 2} ${y0 + 3 + j(3, 2)} L ${x1 - 1 + j(4, 2)} ${y1 - 3} L ${x1 - 10} ${y1 - 2}`;
      return {
        svgW,
        svgH,
        pad,
        mainPath: `${bl} ${br}`,
        tailsPath: '',
        extraPath: '',
        fillD: `M ${x0 + 4} ${y0 + 2} L ${x1 - 4} ${y0 + 2} L ${x1 - 4} ${y1 - 2} L ${x0 + 4} ${y1 - 2} Z`,
      };
    }

    if (boxStyle === 'cloud') {
      // نمط سحابة أفكار يدوية متموجة بفقاعات طبشورية
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      const rx = w / 2;
      const ry = h / 2;
      const cloudD = `
        M ${x0 + 14} ${y0 + 6}
        C ${x0 + w * 0.25} ${y0 - 5 + j(1, 3)}, ${x0 + w * 0.4} ${y0 - 5 + j(2, 3)}, ${cx} ${y0 - 2}
        C ${x1 - w * 0.4} ${y0 - 6 + j(3, 3)}, ${x1 - w * 0.2} ${y0 - 2 + j(4, 3)}, ${x1 - 4} ${y0 + 8}
        C ${x1 + 6 + j(5, 3)} ${cy - 4}, ${x1 + 6 + j(6, 3)} ${cy + 6}, ${x1 - 4} ${y1 - 6}
        C ${x1 - w * 0.2} ${y1 + 5 + j(7, 3)}, ${x1 - w * 0.4} ${y1 + 5 + j(8, 3)}, ${cx} ${y1 + 2}
        C ${x0 + w * 0.4} ${y1 + 6 + j(9, 3)}, ${x0 + w * 0.2} ${y1 + 2 + j(10, 3)}, ${x0 + 4} ${y1 - 8}
        C ${x0 - 6 + j(11, 3)} ${cy + 4}, ${x0 - 6 + j(12, 3)} ${cy - 4}, ${x0 + 14} ${y0 + 6}
        Z
      `;
      return {
        svgW,
        svgH,
        pad,
        mainPath: cloudD,
        tailsPath: '',
        extraPath: '',
        fillD: cloudD,
      };
    }

    // النمط الافتراضي: إطار مستطيل مرسوم باليد بالطبشور مع زوايا متقاطعة (Sketch Box)
    // 1. أربع خطوط متعرجة تحيط بالنص
    const topPath = `M ${x0 - 4 + j(1, 2)} ${y0 + j(2, 2)} Q ${x0 + w * 0.5 + j(3, 3)} ${y0 - 2 + j(4, 2)} ${x1 + 5 + j(5, 2)} ${y0 + 1 + j(6, 2)}`;
    const rightPath = `M ${x1 + j(7, 2)} ${y0 - 5 + j(8, 2)} Q ${x1 + 2 + j(9, 2.5)} ${y0 + h * 0.5 + j(10, 3)} ${x1 - 1 + j(11, 2)} ${y1 + 5 + j(12, 2)}`;
    const bottomPath = `M ${x1 + 4 + j(13, 2)} ${y1 + j(14, 2)} Q ${x0 + w * 0.5 + j(15, 3)} ${y1 + 2 + j(16, 2)} ${x0 - 5 + j(17, 2)} ${y1 - 1 + j(18, 2)}`;
    const leftPath = `M ${x0 + j(19, 2)} ${y1 + 5 + j(20, 2)} Q ${x0 - 2 + j(21, 2.5)} ${y0 + h * 0.5 + j(22, 3)} ${x0 + 1 + j(23, 2)} ${y0 - 5 + j(24, 2)}`;

    const mainRect = `${topPath} ${rightPath} ${bottomPath} ${leftPath}`;

    // 2. زوائد الزوايا المتقاطعة الطبيعية (Tails) التي تميز الرسم المعماري واليدوي بالطبشور
    const tailTL1 = `M ${x0 - 6} ${y0 + 1} L ${x0 + 14} ${y0 - 0.5}`;
    const tailTL2 = `M ${x0 + 1} ${y0 - 6} L ${x0 - 0.5} ${y0 + 14}`;

    const tailTR1 = `M ${x1 - 14} ${y0 + 0.5} L ${x1 + 6} ${y0 + 1.5}`;
    const tailTR2 = `M ${x1 - 0.5} ${y0 - 6} L ${x1 + 1} ${y0 + 14}`;

    const tailBR1 = `M ${x1 + 6} ${y1 - 0.5} L ${x1 - 14} ${y1 + 1}`;
    const tailBR2 = `M ${x1 + 0.5} ${y1 + 6} L ${x1 - 1} ${y1 - 14}`;

    const tailBL1 = `M ${x0 - 6} ${y1 + 1} L ${x0 + 14} ${y1 - 0.5}`;
    const tailBL2 = `M ${x0 - 0.5} ${y1 + 6} L ${x0 + 1} ${y1 - 14}`;

    const tails = `${tailTL1} ${tailTL2} ${tailTR1} ${tailTR2} ${tailBR1} ${tailBR2} ${tailBL1} ${tailBL2}`;

    // 3. مسار تكراري خفيف (second sketch pass) يمنح البوكس مظهر الخط المكرر باليد
    const extraLoop = isRoot
      ? `M ${x0 - 2} ${y0 - 2} Q ${x0 + w * 0.5} ${y0 - 4} ${x1 + 2} ${y0 - 1} Q ${x1 + 4} ${y0 + h * 0.5} ${x1 + 1} ${y1 + 2} Q ${x0 + w * 0.5} ${y1 + 4} ${x0 - 2} ${y1 + 1} Q ${x0 - 4} ${y0 + h * 0.5} ${x0 - 2} ${y0 - 2}`
      : `M ${x0 + 2} ${y0 + 2} Q ${x0 + w * 0.5 + j(25, 2)} ${y0 + 1} ${x1 - 2} ${y0 + 3} Q ${x1} ${y0 + h * 0.5 + j(26, 2)} ${x1 - 3} ${y1 - 2} Q ${x0 + w * 0.5 + j(27, 2)} ${y1 - 1} ${x0 + 3} ${y1 - 3} Z`;

    const fillD = `M ${x0} ${y0} L ${x1} ${y0} L ${x1} ${y1} L ${x0} ${y1} Z`;

    return {
      svgW,
      svgH,
      pad,
      mainPath: mainRect,
      tailsPath: tails,
      extraPath: extraLoop,
      fillD,
    };
  }, [nodeId, width, height, boxStyle, isRoot]);

  return (
    <svg
      className="absolute pointer-events-none overflow-visible select-none"
      style={{
        left: `-${svgData.pad}px`,
        top: `-${svgData.pad}px`,
        width: `${svgData.svgW}px`,
        height: `${svgData.svgH}px`,
        filter: isSelected
          ? `drop-shadow(0 0 6px ${colorHex}) drop-shadow(0 0 12px ${colorHex})`
          : `drop-shadow(0 0 2.5px ${colorHex})`,
      }}
    >
      <defs>
        {/* فلتر خشونة طبشورية خفيفة على الحدود */}
        <filter id={`chalkRough-${nodeId}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={isRoot ? "1.8" : "1.2"} />
        </filter>
      </defs>

      {/* خلفية شبه شفافة لتظليل السبورة تحت النص */}
      <path
        d={svgData.fillD}
        fill={isRoot ? 'rgba(0, 0, 0, 0.72)' : 'rgba(0, 0, 0, 0.48)'}
        stroke="none"
      />

      {/* ضربة الطبشور الرئيسية الأولى للمربع */}
      <path
        d={svgData.mainPath}
        fill="none"
        stroke={colorHex}
        strokeWidth={isRoot ? '3.2' : isSelected ? '2.8' : '2.2'}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#chalkRough-${nodeId})`}
        opacity="0.95"
      />

      {/* زوائد الزوايا المتقاطعة كأنها مرسومة باليد */}
      {svgData.tailsPath && (
        <path
          d={svgData.tailsPath}
          fill="none"
          stroke={colorHex}
          strokeWidth={isRoot ? '2.6' : '1.8'}
          strokeLinecap="round"
          opacity="0.8"
        />
      )}

      {/* الضربة التكرارية الخفيفة (Hand sketch pass 2) */}
      {svgData.extraPath && (
        <path
          d={svgData.extraPath}
          fill="none"
          stroke={colorHex}
          strokeWidth={isRoot ? '2' : '1.4'}
          strokeLinecap="round"
          strokeDasharray={isRoot ? 'none' : '18 4'}
          opacity={isRoot ? '0.75' : '0.45'}
        />
      )}
    </svg>
  );
};
