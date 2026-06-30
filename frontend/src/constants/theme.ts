// ─── Noor Design System ──────────────────────────────────────────────────────
// ANTON-style: white backgrounds, soft pastel tiles, rounded corners, big text

export const Colors = {
  // Backgrounds
  white: '#FFFFFF',
  background: '#F7F7F7',

  // Brand
  green: '#4CAD6D',    // primary action buttons
  greenLight: '#E8F7ED',

  // Tile palette (4 rotating pastels — one per letter row)
  tileYellow: '#FFF0A8',
  tileGreen: '#C8F0D8',
  tileBlue: '#C8E8FF',
  tilePink: '#FFD8E8',

  // Text
  textDark: '#1A1A1A',
  textMedium: '#555555',
  textLight: '#AAAAAA',

  // Stars / coins
  gold: '#F5A623',

  // Feedback
  correct: '#4CAD6D',
  wrong: '#FF5A5A',

  // Answer buttons (idle / correct / wrong states)
  answerIdle: '#F2F2F2',
  answerBorder: '#E0E0E0',
};

export const Fonts = {
  regular: 'Nunito-Regular',
  bold: 'Nunito-Bold',
  extraBold: 'Nunito-ExtraBold',
  arabic: 'NotoNaskhArabic-Regular',
  arabicBold: 'NotoNaskhArabic-Bold',
};

export const Radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  full: 999,
};

// Arabic alphabet in order — used as static fallback when backend is offline
export const ARABIC_LETTERS = [
  { position: 1,  letter: 'ا', nameEn: 'Alif',  nameAr: 'أَلِف', color: 'tileYellow' as const },
  { position: 2,  letter: 'ب', nameEn: 'Ba',    nameAr: 'بَاء',  color: 'tileGreen'  as const },
  { position: 3,  letter: 'ت', nameEn: 'Ta',    nameAr: 'تَاء',  color: 'tileBlue'   as const },
  { position: 4,  letter: 'ث', nameEn: 'Tha',   nameAr: 'ثَاء',  color: 'tilePink'   as const },
  { position: 5,  letter: 'ج', nameEn: 'Jim',   nameAr: 'جِيم',  color: 'tileYellow' as const },
  { position: 6,  letter: 'ح', nameEn: 'Ha',    nameAr: 'حَاء',  color: 'tileGreen'  as const },
  { position: 7,  letter: 'خ', nameEn: 'Kha',   nameAr: 'خَاء',  color: 'tileBlue'   as const },
  { position: 8,  letter: 'د', nameEn: 'Dal',   nameAr: 'دَال',  color: 'tilePink'   as const },
  { position: 9,  letter: 'ذ', nameEn: 'Dhal',  nameAr: 'ذَال',  color: 'tileYellow' as const },
  { position: 10, letter: 'ر', nameEn: 'Ra',    nameAr: 'رَاء',  color: 'tileGreen'  as const },
  { position: 11, letter: 'ز', nameEn: 'Zay',   nameAr: 'زَاي',  color: 'tileBlue'   as const },
  { position: 12, letter: 'س', nameEn: 'Sin',   nameAr: 'سِين',  color: 'tilePink'   as const },
  { position: 13, letter: 'ش', nameEn: 'Shin',  nameAr: 'شِين',  color: 'tileYellow' as const },
  { position: 14, letter: 'ص', nameEn: 'Sad',   nameAr: 'صَاد',  color: 'tileGreen'  as const },
  { position: 15, letter: 'ض', nameEn: 'Dad',   nameAr: 'ضَاد',  color: 'tileBlue'   as const },
  { position: 16, letter: 'ط', nameEn: 'Ta',    nameAr: 'طَاء',  color: 'tilePink'   as const },
  { position: 17, letter: 'ظ', nameEn: 'Dha',   nameAr: 'ظَاء',  color: 'tileYellow' as const },
  { position: 18, letter: 'ع', nameEn: 'Ain',   nameAr: 'عَين',  color: 'tileGreen'  as const },
  { position: 19, letter: 'غ', nameEn: 'Ghain', nameAr: 'غَين',  color: 'tileBlue'   as const },
  { position: 20, letter: 'ف', nameEn: 'Fa',    nameAr: 'فَاء',  color: 'tilePink'   as const },
  { position: 21, letter: 'ق', nameEn: 'Qaf',   nameAr: 'قَاف',  color: 'tileYellow' as const },
  { position: 22, letter: 'ك', nameEn: 'Kaf',   nameAr: 'كَاف',  color: 'tileGreen'  as const },
  { position: 23, letter: 'ل', nameEn: 'Lam',   nameAr: 'لَام',  color: 'tileBlue'   as const },
  { position: 24, letter: 'م', nameEn: 'Mim',   nameAr: 'مِيم',  color: 'tilePink'   as const },
  { position: 25, letter: 'ن', nameEn: 'Nun',   nameAr: 'نُون',  color: 'tileYellow' as const },
  { position: 26, letter: 'ه', nameEn: 'Ha',    nameAr: 'هَاء',  color: 'tileGreen'  as const },
  { position: 27, letter: 'و', nameEn: 'Waw',   nameAr: 'وَاو',  color: 'tileBlue'   as const },
  { position: 28, letter: 'ي', nameEn: 'Ya',    nameAr: 'يَاء',  color: 'tilePink'   as const },
];
