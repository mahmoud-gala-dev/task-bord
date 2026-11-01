import { BoardTheme, ChalkColor } from '../types';

export const BOARD_THEMES: Record<string, BoardTheme> = {
  emerald: {
    id: 'emerald',
    name: 'سبورة زمردية كلاسيكية',
    subtitle: 'النمط التقليدي لسبورات الفصول الدراسية',
    gradientClass: 'from-emerald-950 via-[#0d281e] to-[#06140e]',
    backgroundStyle: 'radial-gradient(ellipse 90% 80% at 50% 30%, #1a4433 0%, #0d281e 52%, #05130e 100%)',
    frameBorderColor: '#8a5a36',
    frameInnerShadow: 'inset 0 0 35px rgba(0, 0, 0, 0.85)',
    woodTexture: 'linear-gradient(135deg, #7c4825 0%, #522d14 50%, #3a1f0d 100%)',
    ambientGlow: 'rgba(26, 68, 51, 0.4)',
    dustIntensity: 0.18,
  },
  obsidian: {
    id: 'obsidian',
    name: 'سبورة الحجر الفحمي',
    subtitle: 'لوحة حجر الأردواز البركاني الداكن',
    gradientClass: 'from-neutral-900 via-[#181c22] to-[#0c0e12]',
    backgroundStyle: 'radial-gradient(ellipse 90% 80% at 50% 30%, #2b333f 0%, #171b21 52%, #0a0c0f 100%)',
    frameBorderColor: '#4d3a2e',
    frameInnerShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.9)',
    woodTexture: 'linear-gradient(135deg, #443224 0%, #291c13 50%, #1a110a 100%)',
    ambientGlow: 'rgba(43, 51, 63, 0.35)',
    dustIntensity: 0.22,
  },
  midnight: {
    id: 'midnight',
    name: 'سبورة الكحلي الفلكي',
    subtitle: 'تدرج ليلي غامق بلمسات المعادلات الرياضية',
    gradientClass: 'from-blue-950 via-[#0e1d35] to-[#060c18]',
    backgroundStyle: 'radial-gradient(ellipse 90% 80% at 50% 30%, #1a355d 0%, #0d1e38 52%, #050d1a 100%)',
    frameBorderColor: '#6d4834',
    frameInnerShadow: 'inset 0 0 35px rgba(0, 0, 0, 0.85)',
    woodTexture: 'linear-gradient(135deg, #643922 0%, #412211 50%, #2a1509 100%)',
    ambientGlow: 'rgba(26, 53, 93, 0.4)',
    dustIntensity: 0.16,
  },
  espresso: {
    id: 'espresso',
    name: 'لوحة الأبنوس والقهوة',
    subtitle: 'خلفية خشبية معتقة بتدرج مخملي فاخر',
    gradientClass: 'from-[#3a2216] via-[#21130c] to-[#0e0704]',
    backgroundStyle: 'radial-gradient(ellipse 90% 80% at 50% 30%, #462c1d 0%, #24140b 52%, #0d0603 100%)',
    frameBorderColor: '#8a5e3f',
    frameInnerShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.88)',
    woodTexture: 'linear-gradient(135deg, #915d38 0%, #5d3820 50%, #371f11 100%)',
    ambientGlow: 'rgba(70, 44, 29, 0.35)',
    dustIntensity: 0.14,
  },
  aurora: {
    id: 'aurora',
    name: 'سبورة الفيروز الداكن',
    subtitle: 'تدرج بترولي عميق بلمعان الشمال',
    gradientClass: 'from-[#103a3d] via-[#092225] to-[#030d0e]',
    backgroundStyle: 'radial-gradient(ellipse 90% 80% at 50% 30%, #1a4f54 0%, #0b282c 52%, #030f11 100%)',
    frameBorderColor: '#5c4535',
    frameInnerShadow: 'inset 0 0 35px rgba(0, 0, 0, 0.85)',
    woodTexture: 'linear-gradient(135deg, #6e462d 0%, #462917 50%, #2b180d 100%)',
    ambientGlow: 'rgba(26, 79, 84, 0.4)',
    dustIntensity: 0.18,
  },
};

export const CHALK_PALETTE: Record<ChalkColor, {
  name: string;
  colorHex: string;
  textClass: string;
  glowClass: string;
  bgDot: string;
  stickShadow: string;
}> = {
  white: {
    name: 'طبشور أبيض كلاسيكي',
    colorHex: '#f8fafc',
    textClass: 'text-neutral-100',
    glowClass: 'chalk-glow-white',
    bgDot: 'bg-neutral-100',
    stickShadow: '0 2px 4px rgba(255,255,255,0.3)',
  },
  yellow: {
    name: 'طبشور أصفر دافئ',
    colorHex: '#fef08a',
    textClass: 'text-yellow-200',
    glowClass: 'chalk-glow-yellow',
    bgDot: 'bg-yellow-300',
    stickShadow: '0 2px 4px rgba(254,240,138,0.3)',
  },
  cyan: {
    name: 'طبشور أزرق سماوي',
    colorHex: '#a5f3fc',
    textClass: 'text-cyan-200',
    glowClass: 'chalk-glow-cyan',
    bgDot: 'bg-cyan-300',
    stickShadow: '0 2px 4px rgba(165,243,252,0.3)',
  },
  mint: {
    name: 'طبشور أخضر نعناعي',
    colorHex: '#a7f3d0',
    textClass: 'text-emerald-200',
    glowClass: 'chalk-glow-mint',
    bgDot: 'bg-emerald-300',
    stickShadow: '0 2px 4px rgba(167,243,208,0.3)',
  },
  pink: {
    name: 'طبشور وردي ناعم',
    colorHex: '#fbcfe8',
    textClass: 'text-pink-200',
    glowClass: 'chalk-glow-pink',
    bgDot: 'bg-pink-300',
    stickShadow: '0 2px 4px rgba(251,207,232,0.3)',
  },
};
