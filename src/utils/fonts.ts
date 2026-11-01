import { FontChoice } from '../types';

export function getHandwritingFontClass(fontChoice: FontChoice, sizeVariant: 'lg' | 'md' | 'sm' = 'lg'): string {
  switch (fontChoice) {
    case 'aref':
      return sizeVariant === 'lg'
        ? 'font-handwriting-ruqaa text-xl sm:text-2xl font-bold tracking-wide'
        : sizeVariant === 'md'
        ? 'font-handwriting-ruqaa text-lg sm:text-xl font-bold'
        : 'font-handwriting-ruqaa text-base sm:text-lg font-normal';

    case 'katibeh':
      return sizeVariant === 'lg'
        ? 'font-handwriting-katibeh text-2xl sm:text-3xl font-normal leading-snug'
        : sizeVariant === 'md'
        ? 'font-handwriting-katibeh text-xl sm:text-2xl font-normal leading-snug'
        : 'font-handwriting-katibeh text-lg sm:text-xl font-normal';

    case 'rakkas':
      return sizeVariant === 'lg'
        ? 'font-handwriting-rakkas text-xl sm:text-2xl font-normal tracking-wide'
        : sizeVariant === 'md'
        ? 'font-handwriting-rakkas text-lg sm:text-xl font-normal'
        : 'font-handwriting-rakkas text-base sm:text-lg font-normal';

    case 'lateef':
      return sizeVariant === 'lg'
        ? 'font-handwriting-lateef text-2xl sm:text-3xl font-bold leading-relaxed'
        : sizeVariant === 'md'
        ? 'font-handwriting-lateef text-xl sm:text-2xl font-bold'
        : 'font-handwriting-lateef text-lg sm:text-xl font-normal';

    case 'amiri':
      return sizeVariant === 'lg'
        ? 'font-handwriting-amiri text-xl sm:text-2xl font-bold leading-relaxed'
        : sizeVariant === 'md'
        ? 'font-handwriting-amiri text-lg sm:text-xl font-bold'
        : 'font-handwriting-amiri text-base sm:text-lg font-normal';

    case 'chalk':
      return sizeVariant === 'lg'
        ? 'font-handwriting-chalk text-lg sm:text-xl font-normal'
        : sizeVariant === 'md'
        ? 'font-handwriting-chalk text-base sm:text-lg font-normal'
        : 'font-handwriting-chalk text-sm sm:text-base font-normal';

    case 'kufi':
      return sizeVariant === 'lg'
        ? 'font-handwriting-kufi text-lg sm:text-xl font-semibold'
        : sizeVariant === 'md'
        ? 'font-handwriting-kufi text-base sm:text-lg font-semibold'
        : 'font-handwriting-kufi text-sm sm:text-base font-normal';

    case 'modern':
    default:
      return sizeVariant === 'lg'
        ? 'font-modern text-base sm:text-lg font-semibold tracking-wide'
        : sizeVariant === 'md'
        ? 'font-modern text-sm sm:text-base font-medium'
        : 'font-modern text-xs sm:text-sm font-normal';
  }
}
