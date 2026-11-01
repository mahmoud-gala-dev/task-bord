// High-resolution procedural SVG background textures for chalkboard (Vintage wood, Classroom slates, Antique timber)

export interface BackgroundPreset {
  id: string;
  name: string;
  category: 'wood' | 'slate' | 'study';
  description: string;
  previewThumbnail: string; // inline data URL or CSS gradient
  getDataUrl: (intensity?: number, warmth?: number) => string;
}

export interface CustomBackgroundConfig {
  baseType: 'vintage-wood' | 'classroom-slate' | 'black-slate' | 'antique-mahogany' | 'rustic-pine' | 'blueprint-navy';
  planksCount: number; // 0 for smooth slate, 2-8 for wooden planks
  grainIntensity: number; // 0.2 to 2.0
  chalkDustHaze: number; // 0 to 1.0
  woodFrame: boolean; // outer wooden molding frame with aged corners
  vignetteIntensity: number; // 0.2 to 0.95
  warmth: number; // 0 to 1.0
}

export const DEFAULT_BG_CONFIG: CustomBackgroundConfig = {
  baseType: 'vintage-wood',
  planksCount: 4,
  grainIntensity: 1.0,
  chalkDustHaze: 0.6,
  woodFrame: true,
  vignetteIntensity: 0.7,
  warmth: 0.6,
};

// 1. ألواح خشب البلوط القديم المعتق (Vintage Antique Oak Panels)
function generateVintageWoodSvg(intensity: number = 1, warmth: number = 0.5): string {
  const rBase = Math.round(48 + warmth * 18);
  const gBase = Math.round(28 + warmth * 10);
  const bBase = Math.round(16 + warmth * 6);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <!-- تعريقات الخشب الطبيعية القديمة -->
      <filter id="woodGrain" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.015 0.5" numOctaves="5" seed="42" result="noise" />
        <feColorMatrix type="matrix" values="
          0.3 0 0 0 0.18
          0 0.22 0 0 0.11
          0 0 0.16 0 0.07
          0 0 0 0.95 0" in="noise" result="coloredWood" />
        <feBlend in="SourceGraphic" in2="coloredWood" mode="multiply" />
      </filter>

      <!-- نسيج الشقوق وتعرجات الخشب المعتق -->
      <filter id="woodRings">
        <feTurbulence type="turbulence" baseFrequency="0.03 0.12" numOctaves="3" seed="12" result="rings" />
        <feDisplacementMap in="SourceGraphic" in2="rings" scale="6" />
      </filter>
    </defs>

    <!-- لون الأساس الخشبي العميق -->
    <rect width="1200" height="800" fill="rgb(${rBase}, ${gBase}, ${bBase})" />

    <!-- لوح خشب 1 -->
    <rect x="0" y="0" width="1200" height="196" fill="rgba(255, 255, 255, 0.03)" filter="url(#woodGrain)" />
    <line x1="0" y1="198" x2="1200" y2="198" stroke="rgba(0, 0, 0, 0.75)" stroke-width="4" />
    <line x1="0" y1="200" x2="1200" y2="200" stroke="rgba(255, 255, 255, 0.06)" stroke-width="1.5" />

    <!-- لوح خشب 2 -->
    <rect x="0" y="200" width="1200" height="196" fill="rgba(0, 0, 0, 0.1)" filter="url(#woodGrain)" />
    <line x1="0" y1="398" x2="1200" y2="398" stroke="rgba(0, 0, 0, 0.75)" stroke-width="4" />
    <line x1="0" y1="400" x2="1200" y2="400" stroke="rgba(255, 255, 255, 0.06)" stroke-width="1.5" />

    <!-- لوح خشب 3 -->
    <rect x="0" y="400" width="1200" height="196" fill="rgba(255, 255, 255, 0.02)" filter="url(#woodGrain)" />
    <line x1="0" y1="598" x2="1200" y2="598" stroke="rgba(0, 0, 0, 0.75)" stroke-width="4" />
    <line x1="0" y1="600" x2="1200" y2="600" stroke="rgba(255, 255, 255, 0.06)" stroke-width="1.5" />

    <!-- لوح خشب 4 -->
    <rect x="0" y="600" width="1200" height="200" fill="rgba(0, 0, 0, 0.08)" filter="url(#woodGrain)" />

    <!-- مسحات باهتة من غبار الطبشور القديم على الخشب -->
    <path d="M 120 80 Q 400 40 750 120 Q 1050 200 1150 150" fill="none" stroke="rgba(255, 255, 255, 0.03)" stroke-width="90" filter="blur(30px)" />
    <path d="M 80 420 Q 350 480 800 390 Q 1100 320 1180 460" fill="none" stroke="rgba(255, 255, 255, 0.025)" stroke-width="120" filter="blur(40px)" />
    <path d="M 200 680 Q 600 620 950 710" fill="none" stroke="rgba(255, 255, 255, 0.03)" stroke-width="80" filter="blur(35px)" />

    <!-- تظليل حواف اللوح الخشبي (Vignette) -->
    <radialGradient id="vignette" cx="50%" cy="50%" r="65%">
      <stop offset="60%" stop-color="transparent" />
      <stop offset="100%" stop-color="rgba(0, 0, 0, 0.65)" />
    </radialGradient>
    <rect width="1200" height="800" fill="url(#vignette)" />
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 2. سبورة الفصول المدرسية الزمردية الكلاسيكية (Classic Classroom Slate Blackboard)
function generateClassroomSlateSvg(intensity: number = 1, warmth: number = 0.5): string {
  const gBase = Math.round(42 + warmth * 12);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <!-- نسيج حجر الأردواز المدرسي المسامي -->
      <filter id="slatePores" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" seed="8" result="noise" />
        <feColorMatrix type="matrix" values="
          0 0 0 0 0.07
          0 0 0 0 ${gBase / 255}
          0 0 0 0 0.12
          0 0 0 0.85 0" in="noise" result="stone" />
        <feBlend in="SourceGraphic" in2="stone" mode="multiply" />
      </filter>
    </defs>

    <!-- لون حجر الأردواز الأخضر الزمردي الكلاسيكي -->
    <rect width="1200" height="800" fill="#0d281e" />
    <rect width="1200" height="800" fill="rgba(255, 255, 255, 0.04)" filter="url(#slatePores)" />

    <!-- مسحات مسح الممحاة الطبشورية العريضة (Chalk Eraser Sweeps) -->
    <path d="M 50 140 Q 300 90 600 160 Q 900 230 1150 130" fill="none" stroke="rgba(255, 255, 255, 0.05)" stroke-width="110" filter="blur(25px)" />
    <path d="M 80 320 Q 400 400 700 290 Q 1000 180 1180 340" fill="none" stroke="rgba(255, 255, 255, 0.045)" stroke-width="130" filter="blur(30px)" />
    <path d="M 120 560 Q 450 490 850 580 Q 1100 640 1160 520" fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="140" filter="blur(35px)" />
    <path d="M 180 720 Q 550 750 900 690" fill="none" stroke="rgba(255, 255, 255, 0.035)" stroke-width="90" filter="blur(25px)" />

    <!-- غبار طبشوري متناثر ناعم -->
    <circle cx="240" cy="180" r="140" fill="rgba(255, 255, 255, 0.025)" filter="blur(40px)" />
    <circle cx="820" cy="380" r="180" fill="rgba(255, 255, 255, 0.03)" filter="blur(50px)" />
    <circle cx="480" cy="620" r="160" fill="rgba(255, 255, 255, 0.028)" filter="blur(45px)" />

    <!-- تظليل الإطار العريض للسبورة -->
    <radialGradient id="slateVignette" cx="50%" cy="50%" r="70%">
      <stop offset="65%" stop-color="transparent" />
      <stop offset="100%" stop-color="rgba(0, 0, 0, 0.65)" />
    </radialGradient>
    <rect width="1200" height="800" fill="url(#slateVignette)" />
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 3. سبورة حجر الأردواز الفحمي البركاني (Obsidian Slate Stone)
function generateObsidianSlateSvg(intensity: number = 1): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <!-- ملمس الحجر الفحمي الداكن مع ذرات المعادن -->
      <filter id="charcoalTexture" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" seed="19" result="noise" />
        <feColorMatrix type="matrix" values="
          0 0 0 0 0.1
          0 0 0 0 0.12
          0 0 0 0 0.14
          0 0 0 0.9 0" in="noise" result="mineral" />
        <feBlend in="SourceGraphic" in2="mineral" mode="overlay" />
      </filter>
    </defs>

    <rect width="1200" height="800" fill="#121519" />
    <rect width="1200" height="800" fill="rgba(255, 255, 255, 0.03)" filter="url(#charcoalTexture)" />

    <!-- مسحات طبشورية رمادية خفيفة -->
    <path d="M 100 200 C 450 150, 750 300, 1100 180" fill="none" stroke="rgba(255, 255, 255, 0.035)" stroke-width="120" filter="blur(35px)" />
    <path d="M 60 480 C 400 520, 800 440, 1140 500" fill="none" stroke="rgba(255, 255, 255, 0.03)" stroke-width="130" filter="blur(40px)" />

    <!-- تدرج الفحم العميق -->
    <radialGradient id="charcoalVignette" cx="50%" cy="50%" r="65%">
      <stop offset="50%" stop-color="transparent" />
      <stop offset="100%" stop-color="rgba(0, 0, 0, 0.75)" />
    </radialGradient>
    <rect width="1200" height="800" fill="url(#charcoalVignette)" />
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 4. ألواح خشب الماهوجني والأبنوس العتيق (Antique Mahogany Study Board)
function generateAntiqueMahoganySvg(intensity: number = 1): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <filter id="mahoganyGrain" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.45" numOctaves="4" seed="99" result="grain" />
        <feColorMatrix type="matrix" values="
          0.38 0 0 0 0.16
          0 0.18 0 0 0.08
          0 0 0.12 0 0.05
          0 0 0 0.9 0" in="grain" result="wood" />
        <feBlend in="SourceGraphic" in2="wood" mode="multiply" />
      </filter>
    </defs>

    <rect width="1200" height="800" fill="#2d170e" />
    <rect width="1200" height="800" fill="rgba(255, 255, 255, 0.02)" filter="url(#mahoganyGrain)" />

    <!-- ألواح خشبية عمودية أنيقة ذات طابع المكاتب الملكية العتيقة -->
    <line x1="300" y1="0" x2="300" y2="800" stroke="rgba(0, 0, 0, 0.6)" stroke-width="3" />
    <line x1="301" y1="0" x2="301" y2="800" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1" />

    <line x1="600" y1="0" x2="600" y2="800" stroke="rgba(0, 0, 0, 0.6)" stroke-width="3" />
    <line x1="601" y1="0" x2="601" y2="800" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1" />

    <line x1="900" y1="0" x2="900" y2="800" stroke="rgba(0, 0, 0, 0.6)" stroke-width="3" />
    <line x1="901" y1="0" x2="901" y2="800" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1" />

    <!-- وهج دافئ مخملي في المنتصف -->
    <radialGradient id="mahoganyGlow" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="rgba(255, 180, 120, 0.06)" />
      <stop offset="60%" stop-color="transparent" />
      <stop offset="100%" stop-color="rgba(0, 0, 0, 0.7)" />
    </radialGradient>
    <rect width="1200" height="800" fill="url(#mahoganyGlow)" />
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 5. سبورة خشب الصنوبر الريفي المعتق (Rustic Weathered Pine Chalkboard)
function generateRusticPineSvg(intensity: number = 1): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <filter id="pineTexture" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.35" numOctaves="4" seed="73" result="noise" />
        <feColorMatrix type="matrix" values="
          0.26 0 0 0 0.12
          0 0.22 0 0 0.11
          0 0 0.2 0 0.1
          0 0 0 0.95 0" in="noise" result="weathered" />
        <feBlend in="SourceGraphic" in2="weathered" mode="multiply" />
      </filter>
    </defs>

    <rect width="1200" height="800" fill="#24211d" />
    <rect width="1200" height="800" fill="rgba(255, 255, 255, 0.03)" filter="url(#pineTexture)" />

    <!-- مسحات طبشورية مائلة عبر الألواح -->
    <path d="M 80 180 Q 500 240 900 140 Q 1150 80 1180 220" fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="100" filter="blur(30px)" />
    <path d="M 60 520 Q 400 460 780 540 Q 1050 600 1160 480" fill="none" stroke="rgba(255, 255, 255, 0.035)" stroke-width="120" filter="blur(35px)" />

    <radialGradient id="pineVignette" cx="50%" cy="50%" r="65%">
      <stop offset="55%" stop-color="transparent" />
      <stop offset="100%" stop-color="rgba(0, 0, 0, 0.72)" />
    </radialGradient>
    <rect width="1200" height="800" fill="url(#pineVignette)" />
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 6. سبورة الكحلي الفلكي والمخططات الهندسية (Blueprint Slate Chalkboard)
function generateBlueprintSlateSvg(intensity: number = 1): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <!-- شبكة تخطيط هندسي خفيفة جداً كسبورات الهندسة والفيزياء -->
      <pattern id="chalkGrid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(165, 243, 252, 0.03)" stroke-width="1" />
      </pattern>
      <filter id="navySlateNoise" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="55" result="noise" />
        <feColorMatrix type="matrix" values="
          0 0 0 0 0.04
          0 0 0 0 0.1
          0 0 0 0 0.22
          0 0 0 0.85 0" in="noise" result="blueSlate" />
        <feBlend in="SourceGraphic" in2="blueSlate" mode="multiply" />
      </filter>
    </defs>

    <rect width="1200" height="800" fill="#081426" />
    <rect width="1200" height="800" fill="rgba(255, 255, 255, 0.03)" filter="url(#navySlateNoise)" />
    <rect width="1200" height="800" fill="url(#chalkGrid)" />

    <!-- غبار طبشوري سحابي أزرق باهت -->
    <circle cx="350" cy="280" r="220" fill="rgba(165, 243, 252, 0.025)" filter="blur(60px)" />
    <circle cx="850" cy="520" r="250" fill="rgba(165, 243, 252, 0.03)" filter="blur(70px)" />

    <radialGradient id="navyVignette" cx="50%" cy="50%" r="70%">
      <stop offset="50%" stop-color="transparent" />
      <stop offset="100%" stop-color="rgba(0, 0, 0, 0.8)" />
    </radialGradient>
    <rect width="1200" height="800" fill="url(#navyVignette)" />
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// قائمة القوالب الجاهزة المعرفة للخلفيات
export const CHALK_BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'vintage-oak-panels',
    name: 'ألواح خشب البلوط القديم المعتق 🪵',
    category: 'wood',
    description: 'ألواح خشبية أثرية داكنة بتعريقات حقيقية وملمس طبيعي معتق يبعث على الهدوء والتركيز',
    previewThumbnail: 'linear-gradient(135deg, #3d2315 0%, #24140b 50%, #150a04 100%)',
    getDataUrl: generateVintageWoodSvg,
  },
  {
    id: 'classic-classroom-slate',
    name: 'سبورة الفصول المدرسية الزمردية 🏫',
    category: 'slate',
    description: 'سبورة حجر أردواز خضراء كلاسيكية مع آثار مسح ممحاة الطبشور الواقعية وأجواء الفصول المدرسية الأصيلة',
    previewThumbnail: 'radial-gradient(ellipse at 50% 30%, #173f2e 0%, #0d281e 52%, #05140e 100%)',
    getDataUrl: generateClassroomSlateSvg,
  },
  {
    id: 'obsidian-charcoal-stone',
    name: 'لوحة حجر الأردواز الفحمي البركاني 🌋',
    category: 'slate',
    description: 'لوحة حجر أسود فحمي داكن ذو ذرات معدنية طبيعية يمنح نصوص ورسومات الطبشور لمعاناً فائق النقاء',
    previewThumbnail: 'radial-gradient(ellipse at 50% 30%, #23272e 0%, #13161a 52%, #0a0b0d 100%)',
    getDataUrl: generateObsidianSlateSvg,
  },
  {
    id: 'antique-mahogany-study',
    name: 'خشب الماهوجني والأبنوس العتيق 🏛️',
    category: 'wood',
    description: 'مكتب دراسي كلاسيكي عتيق بألواح ماهوجني معتقة ومخملية تناسب التخطيط العميق والمشاريع الكبرى',
    previewThumbnail: 'linear-gradient(135deg, #3a1e12 0%, #200f08 50%, #0f0603 100%)',
    getDataUrl: generateAntiqueMahoganySvg,
  },
  {
    id: 'rustic-weathered-pine',
    name: 'خشب الصنوبر الريفي المعتق 🌲',
    category: 'wood',
    description: 'ألواح خشبية ريفية بطابع طبيعي رمادي داكن وبقايا مسحات طبشورية عفوية لطيفة',
    previewThumbnail: 'linear-gradient(135deg, #2b2723 0%, #1c1916 50%, #0f0d0c 100%)',
    getDataUrl: generateRusticPineSvg,
  },
  {
    id: 'blueprint-astronomy-slate',
    name: 'سبورة الهندسة والكحلي الفلكي 📐',
    category: 'study',
    description: 'لوحة كحلية عميقة مع شبكة تخطيط خافتة جداً ومسحات سحابية زرقاء تناسب رسم المخططات وخرائط XMind',
    previewThumbnail: 'radial-gradient(ellipse at 50% 30%, #13243f 0%, #081426 52%, #030810 100%)',
    getDataUrl: generateBlueprintSlateSvg,
  },
];

// دالة التوليد المخصصة الديناميكية لإنشاء ألواح خشبية معتقة وسبورات مدرسية مخصصة
export function generateCustomBoardTexture(config: CustomBackgroundConfig): string {
  const width = 1600;
  const height = 900;
  const { baseType, planksCount, grainIntensity, chalkDustHaze, woodFrame, vignetteIntensity, warmth } = config;

  let baseFill = '#22150d';
  let filterDef = '';
  let textureLayer = '';

  if (baseType === 'classroom-slate') {
    const gVal = Math.round(36 + warmth * 14);
    baseFill = `rgb(11, ${gVal}, 25)`;
    filterDef = `
      <filter id="customSlate" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="${0.5 * grainIntensity}" numOctaves="4" seed="77" result="noise" />
        <feColorMatrix type="matrix" values="
          0 0 0 0 0.05
          0 0 0 0 ${(gVal + 10) / 255}
          0 0 0 0 0.12
          0 0 0 0.9 0" in="noise" result="stone" />
        <feBlend in="SourceGraphic" in2="stone" mode="multiply" />
      </filter>`;
    textureLayer = `<rect width="${width}" height="${height}" fill="rgba(255, 255, 255, 0.03)" filter="url(#customSlate)" />`;
  } else if (baseType === 'black-slate') {
    baseFill = '#13161a';
    filterDef = `
      <filter id="customBlackSlate" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="${0.6 * grainIntensity}" numOctaves="4" seed="31" result="noise" />
        <feColorMatrix type="matrix" values="
          0 0 0 0 0.12
          0 0 0 0 0.14
          0 0 0 0 0.16
          0 0 0 0.9 0" in="noise" result="stone" />
        <feBlend in="SourceGraphic" in2="stone" mode="overlay" />
      </filter>`;
    textureLayer = `<rect width="${width}" height="${height}" fill="rgba(255, 255, 255, 0.035)" filter="url(#customBlackSlate)" />`;
  } else if (baseType === 'blueprint-navy') {
    baseFill = '#071427';
    filterDef = `
      <filter id="customNavy" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="${0.55 * grainIntensity}" numOctaves="3" seed="101" result="noise" />
        <feColorMatrix type="matrix" values="
          0 0 0 0 0.04
          0 0 0 0 0.1
          0 0 0 0 0.22
          0 0 0 0.85 0" in="noise" result="stone" />
        <feBlend in="SourceGraphic" in2="stone" mode="multiply" />
      </filter>`;
    textureLayer = `
      <rect width="${width}" height="${height}" fill="rgba(255, 255, 255, 0.03)" filter="url(#customNavy)" />
      <pattern id="customGrid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(165, 243, 252, 0.035)" stroke-width="1" />
      </pattern>
      <rect width="${width}" height="${height}" fill="url(#customGrid)" />
    `;
  } else {
    // Vintage Wood / Mahogany / Rustic Pine
    const rBase = baseType === 'antique-mahogany' 
      ? Math.round(48 + warmth * 14) 
      : baseType === 'rustic-pine' 
        ? Math.round(38 + warmth * 10) 
        : Math.round(52 + warmth * 20);
    const gBase = baseType === 'antique-mahogany' 
      ? Math.round(24 + warmth * 8) 
      : baseType === 'rustic-pine' 
        ? Math.round(32 + warmth * 8) 
        : Math.round(30 + warmth * 12);
    const bBase = baseType === 'antique-mahogany' 
      ? Math.round(15 + warmth * 4) 
      : baseType === 'rustic-pine' 
        ? Math.round(26 + warmth * 6) 
        : Math.round(18 + warmth * 8);

    baseFill = `rgb(${rBase}, ${gBase}, ${bBase})`;
    filterDef = `
      <filter id="customWoodGrain" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="${(0.015 * grainIntensity).toFixed(4)} ${(0.45 * grainIntensity).toFixed(4)}" numOctaves="4" seed="42" result="noise" />
        <feColorMatrix type="matrix" values="
          0.32 0 0 0 0.2
          0 0.22 0 0 0.12
          0 0 0.16 0 0.08
          0 0 0 0.95 0" in="noise" result="wood" />
        <feBlend in="SourceGraphic" in2="wood" mode="multiply" />
      </filter>`;
    textureLayer = `<rect width="${width}" height="${height}" fill="rgba(255, 255, 255, 0.025)" filter="url(#customWoodGrain)" />`;
  }

  // أسطر وفواصل الألواح الخشبية (Horizontal Planks)
  let planksSvg = '';
  if (planksCount > 1) {
    const plankHeight = height / planksCount;
    for (let i = 1; i < planksCount; i++) {
      const y = Math.round(i * plankHeight);
      planksSvg += `
        <line x1="0" y1="${y - 1}" x2="${width}" y2="${y - 1}" stroke="rgba(0, 0, 0, 0.85)" stroke-width="3.5" />
        <line x1="0" y1="${y + 1}" x2="${width}" y2="${y + 1}" stroke="rgba(255, 255, 255, 0.07)" stroke-width="1.5" />
      `;
      // مسامير تثبيت الألواح على الحواف
      planksSvg += `
        <circle cx="35" cy="${y - plankHeight / 2}" r="4" fill="rgba(20, 10, 5, 0.9)" />
        <circle cx="35" cy="${y - plankHeight / 2}" r="3" fill="rgba(70, 45, 25, 0.8)" />
        <circle cx="${width - 35}" cy="${y - plankHeight / 2}" r="4" fill="rgba(20, 10, 5, 0.9)" />
        <circle cx="${width - 35}" cy="${y - plankHeight / 2}" r="3" fill="rgba(70, 45, 25, 0.8)" />
      `;
    }
  }

  // مسحات وبودرة الطبشور القديمة (Chalk Dust & Eraser Sweeps)
  let chalkDustSvg = '';
  if (chalkDustHaze > 0) {
    const op = (chalkDustHaze * 0.07).toFixed(3);
    const opSoft = (chalkDustHaze * 0.04).toFixed(3);
    chalkDustSvg = `
      <path d="M 100 150 Q 500 80 900 180 Q 1300 280 1550 160" fill="none" stroke="rgba(255, 255, 255, ${op})" stroke-width="130" filter="blur(35px)" />
      <path d="M 80 440 Q 450 540 900 420 Q 1350 320 1540 480" fill="none" stroke="rgba(255, 255, 255, ${op})" stroke-width="150" filter="blur(40px)" />
      <path d="M 150 720 Q 600 640 1100 760 Q 1450 820 1520 680" fill="none" stroke="rgba(255, 255, 255, ${op})" stroke-width="120" filter="blur(35px)" />
      <circle cx="300" cy="220" r="180" fill="rgba(255, 255, 255, ${opSoft})" filter="blur(55px)" />
      <circle cx="1100" cy="460" r="220" fill="rgba(255, 255, 255, ${opSoft})" filter="blur(65px)" />
      <circle cx="650" cy="700" r="200" fill="rgba(255, 255, 255, ${opSoft})" filter="blur(60px)" />
    `;
  }

  // الإطار الخشبي المحيط للسبورة مع زوايا نحاسية/أثرية (Wood Molding Frame)
  let frameSvg = '';
  if (woodFrame) {
    frameSvg = `
      <!-- إطار خشبي عريض مع تدرج مجسم -->
      <rect x="0" y="0" width="${width}" height="28" fill="url(#frameWoodH)" />
      <rect x="0" y="${height - 28}" width="${width}" height="28" fill="url(#frameWoodH)" />
      <rect x="0" y="0" width="28" height="${height}" fill="url(#frameWoodV)" />
      <rect x="${width - 28}" y="0" width="28" height="${height}" fill="url(#frameWoodV)" />

      <!-- خطوط الظل والضوء الداخلي للإطار -->
      <rect x="28" y="28" width="${width - 56}" height="${height - 56}" fill="none" stroke="rgba(0, 0, 0, 0.75)" stroke-width="4" />
      <rect x="30" y="30" width="${width - 60}" height="${height - 60}" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1.5" />

      <!-- قطع الزوايا النحاسية العتيقة مع المسامير -->
      <polygon points="0,0 60,0 60,18 18,18 18,60 0,60" fill="#784e2d" stroke="#3d2312" stroke-width="1" />
      <circle cx="14" cy="14" r="3.5" fill="#e5a95d" stroke="#523219" stroke-width="1" />
      
      <polygon points="${width},0 ${width - 60},0 ${width - 60},18 ${width - 18},18 ${width - 18},60 ${width},60" fill="#784e2d" stroke="#3d2312" stroke-width="1" />
      <circle cx="${width - 14}" cy="14" r="3.5" fill="#e5a95d" stroke="#523219" stroke-width="1" />
      
      <polygon points="0,${height} 60,${height} 60,${height - 18} 18,${height - 18} 18,${height - 60} 0,${height - 60}" fill="#784e2d" stroke="#3d2312" stroke-width="1" />
      <circle cx="14" cy="${height - 14}" r="3.5" fill="#e5a95d" stroke="#523219" stroke-width="1" />
      
      <polygon points="${width},${height} ${width - 60},${height} ${width - 60},${height - 18} ${width - 18},${height - 18} ${width - 18},${height - 60} ${width},${height - 60}" fill="#784e2d" stroke="#3d2312" stroke-width="1" />
      <circle cx="${width - 14}" cy="${height - 14}" r="3.5" fill="#e5a95d" stroke="#523219" stroke-width="1" />
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      ${filterDef}
      <linearGradient id="frameWoodH" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4a2c1a" />
        <stop offset="50%" stop-color="#351d11" />
        <stop offset="100%" stop-color="#1f0f08" />
      </linearGradient>
      <linearGradient id="frameWoodV" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#4a2c1a" />
        <stop offset="50%" stop-color="#351d11" />
        <stop offset="100%" stop-color="#1f0f08" />
      </linearGradient>
      <radialGradient id="customVignette" cx="50%" cy="50%" r="70%">
        <stop offset="50%" stop-color="transparent" />
        <stop offset="100%" stop-color="rgba(0, 0, 0, ${vignetteIntensity.toFixed(2)})" />
      </radialGradient>
    </defs>

    <!-- لون الأساس -->
    <rect width="${width}" height="${height}" fill="${baseFill}" />

    <!-- طبقة الملمس والحبيبات -->
    ${textureLayer}

    <!-- فواصل الألواح الخشبية ومسامير التثبيت -->
    ${planksSvg}

    <!-- مسحات الطبشور والغبار -->
    ${chalkDustSvg}

    <!-- تظليل الفينتاج المحيط -->
    <rect width="${width}" height="${height}" fill="url(#customVignette)" />

    <!-- الإطار الخشبي المحيط إذا تم تفعيله -->
    ${frameSvg}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// دالة تصدير الخلفية كصورة PNG عالية الدقة (HD 1920x1080)
export async function exportBackgroundAsPng(dataUrl: string, filename: string = 'chalkboard-vintage-background.png'): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        ctx.drawImage(img, 0, 0, 1920, 1080);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = filename;
        link.href = pngUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (e) => reject(e);
    img.src = dataUrl;
  });
}

