// Google Chrome & Web Browser Notifications Helper for Focus Timer

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export function getBrowserNotificationState(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionState;
}

export async function requestChromeNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission();
      return result === 'granted';
    }
  } catch (err) {
    console.warn('Notification permission error:', err);
  }
  return false;
}

export function sendChromeNotification(
  title: string,
  body: string,
  tag: string = 'chalk-focus-timer'
): boolean {
  if (typeof window === 'undefined') return false;

  // Update document title so user sees it in Chrome tab immediately
  updateChromeTabTitle(title);

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const n = new Notification(title, {
        body,
        tag,
        requireInteraction: false,
        silent: false,
      });

      // Close automatically after 8 seconds
      setTimeout(() => {
        try {
          n.close();
        } catch {}
      }, 8000);

      return true;
    } catch (e) {
      console.warn('Could not launch Chrome Notification:', e);
    }
  }
  return false;
}

let originalTitle: string = '';

export function updateChromeTabTitle(prefix?: string) {
  if (typeof document === 'undefined') return;
  if (!originalTitle) {
    originalTitle = document.title || 'لوحة المهام | Chalkboard Tasks';
  }

  if (prefix) {
    document.title = `${prefix} | ${originalTitle}`;
  } else {
    document.title = originalTitle;
  }
}

// نصوص إشعارات المراحل 25% - 50% - 75% - 100% المكتوبة بأسلوب تحفيزي
export const MILESTONE_NOTIFICATIONS: Record<number, { title: string; body: string; icon: string }> = {
  25: {
    title: 'ربع وقت التركيز مضى (25%) 🎯',
    body: 'بداية موفقة وممتازة! عقلك الآن في حالة التدفق والتركيز العميق، واصل بنفس الهدوء.',
    icon: '🎯',
  },
  50: {
    title: 'منتصف جلسة التركيز (50%) ⚡',
    body: 'نصف المسافة أُنجزت بنجاح! احتفظ بتركيزك وطاقتك، أنت تسير بخطى ثابتة ومبهرة.',
    icon: '⚡',
  },
  75: {
    title: 'شرفت الجلسة على الاكتمال (75%) 🚀',
    body: 'لم يتبق سوى القليل! ضع لمساتك الأخيرة وأنهِ ما بيدك بإتقان قبل دق جرس النهاية.',
    icon: '🚀',
  },
  100: {
    title: '🏆 انتهى وقت التركيز بنجاح (100%)!',
    body: 'عمل مبارك ورائع جداً! خذ استراحة مستحقة لتجديد طاقتك، ثم احتفل بما أنجزت.',
    icon: '🏆',
  },
};
