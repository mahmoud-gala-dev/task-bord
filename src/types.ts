export type ChalkColor = 'white' | 'yellow' | 'cyan' | 'pink' | 'mint';

export interface SubTaskItem {
  id: string;
  name: string;
  completed: boolean;
  createdAt: number;
}

export interface TaskItem {
  id: string;
  name: string; // اسم المهمة الرئيسية
  completed: boolean;
  chalkColor: ChalkColor;
  icon?: string; // رمز تعبيري أو أيقونة طبشورية مناسبة
  subtasks?: SubTaskItem[]; // قوائم فرعية تابعة للمهمة
  locked?: boolean; // قفل المهمة لمنع سحبها أو تحريكها بالخطأ
  createdAt: number;
}

export interface FreeChalkText {
  id: string;
  text: string;
  x: number; // px coordinates on board
  y: number; // px coordinates on board
  color: ChalkColor;
  icon?: string; // رمز أو أيقونة للملاحظة
  fontSize?: number; // font size in px (e.g., 20 to 60)
  rotation?: number; // rotation angle in degrees (-180 to 180)
  locked?: boolean; // قفل الملاحظة في مكانها لمنع سحبها أو تدويرها
  layer?: 'front' | 'back'; // ترتيب الطبقة مقارنة بالمهام (front: فوق المهام, back: خلف المهام)
  createdAt: number;
}

// ستيكر طبشوري قابل للسحب والإفلات والتدوير والتكبير
export interface ChalkSticker {
  id: string;
  icon: string; // رمز الستيكر أو الأيقونة
  label?: string; // تسمية أو نص شارة اختيارية
  badgeStyle?: 'emoji' | 'chalk-badge' | 'pin-note' | 'stamp';
  x: number;
  y: number;
  size: number; // بالحجم بكسل (مثلا 40 إلى 120)
  rotation: number; // زاوية الستيكر
  color?: ChalkColor;
  locked?: boolean; // قفل الستيكر في مكانه
  createdAt: number;
}

export interface ChalkLink {
  id: string;
  taskId: string;
  noteId: string;
  color?: ChalkColor;
  label?: string; // تسمية اختيارية على الوصلة
  createdAt: number;
}

// ضربة رسم حرة بالطبشور
export interface ChalkStrokePoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface ChalkStroke {
  id: string;
  points: ChalkStrokePoint[];
  color: ChalkColor;
  size: number; // stroke width (e.g. 2 to 24px)
  createdAt: number;
}

export interface WorkspaceView {
  panX: number; // horizontal pan offset
  panY: number; // vertical pan offset
  zoom: number; // zoom scale factor (e.g. 0.5 to 2.0)
}

export type BoardThemeId = 'emerald' | 'obsidian' | 'midnight' | 'espresso' | 'aurora';

export interface BoardTheme {
  id: BoardThemeId;
  name: string;
  subtitle: string;
  gradientClass: string;
  backgroundStyle: string;
  frameBorderColor: string;
  frameInnerShadow: string;
  woodTexture: string;
  ambientGlow: string;
  dustIntensity: number;
}

// نموذج الصبورة المتعددة (Multiple Chalkboards)
export interface BoardTab {
  id: string;
  title: string;
  themeId: BoardThemeId;
  tasks: TaskItem[];
  freeNotes: FreeChalkText[];
  stickers?: ChalkSticker[]; // ستيكرات الصبورة
  strokes?: ChalkStroke[]; // خطوط ورسومات الطبشور الحرة
  links: ChalkLink[];
  workspace: WorkspaceView;
  xmindMap?: XMindNode; // خريطة XMind الذهنية الخاصة بالصبورة
  customBgUrl?: string; // خلفية مخصصة أو لوح خشبي/سبورة مدرسية تم توليدها
  customBgPresetId?: string; // معرف القالب المختار
  createdAt: number;
}

export type FilterType = 'all' | 'active' | 'completed';

// أنماط بوكس فروع خريطة XMind التي تشبه الكتابة باليد
export type XMindBoxStyle = 'sketch' | 'underline' | 'bracket' | 'cloud';

// عقدة خريطة ذهن XMind مبسطة تخدم مهام المشروع
export interface XMindNode {
  id: string;
  text: string;
  color: ChalkColor;
  icon?: string;
  completed?: boolean;
  collapsed?: boolean;
  children?: XMindNode[];
  taskId?: string;      // ربط المهمة الرئيسية المقابلة بالصبورة
  subtaskId?: string;   // ربط المهمة الفرعية المقابلة
  boxStyle?: XMindBoxStyle; // نمط مظهر البوكس الشبيه بالكتابة
}

// خيارات التحكم في تأثيرات السبورة والواقعية
export interface BoardEffectsSettings {
  chippedEdges: boolean;    // تأثير الحواف المكسورة والمتآكلة (Chipped & Jagged Edges)
  depthOfField: boolean;    // عمق المجال البصري والتركيز عند التكبير (Depth-of-Field Zoom Blur)
  dustGrain: boolean;       // مسحات وبودرة الطبشور (Chalk Dust Sweeps)
  frameVignette: boolean;   // تعتيم وظلال إطار السبورة الديناميكي (Dynamic Frame Vignette)
  gritNoise: boolean;       // نسيج الحجر الفحمي الحبيبي (SVG Slate Grit Noise)
  chalkBorder: boolean;     // إطار الطبشور اليدوي المحيط بالسبورة (Hand-drawn Chalk Border)
}

export const DEFAULT_BOARD_EFFECTS: BoardEffectsSettings = {
  chippedEdges: true,
  depthOfField: true,
  dustGrain: true,
  frameVignette: true,
  gritNoise: true,
  chalkBorder: true,
};

// مجموعة خطوط اليد العربية الأصيلة والمتشابهة مع حركة القلم والطبشور
export type FontChoice = 
  | 'aref'     // رقعة يدوي أصيل
  | 'katibeh'  // كتيبة يدوي متصل
  | 'rakkas'   // رقاص مائل فني
  | 'lateef'   // لطيف يدوي منساب
  | 'amiri'    // نسخ القلم العربي
  | 'chalk'    // مرح السبورة
  | 'kufi'     // كوفي مخطوط
  | 'modern';  // حديث نقي
