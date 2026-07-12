/**
 * Seeds the "Arabic Alphabet" topic — 28 letters + 28 lessons.
 */
import Topic from '../../src/models/Topic';
import Letter from '../../src/models/Letter';
import Lesson from '../../src/models/Lesson';

// ── 28 Arabic letters data ────────────────────────────────────────────────────
const lettersData = [
  {
    position: 1,
    letter: 'ا',
    name_en: 'Alif',
    name_ar: 'أَلِف',
    forms: { isolated: 'ا', initial: 'ا', medial: 'ـا', final: 'ـا' },
  },
  {
    position: 2,
    letter: 'ب',
    name_en: 'Ba',
    name_ar: 'بَاءْ',
    forms: { isolated: 'ب', initial: 'بـ', medial: 'ـبـ', final: 'ـب' },
  },
  {
    position: 3,
    letter: 'ت',
    name_en: 'Ta',
    name_ar: 'تَاءْ',
    forms: { isolated: 'ت', initial: 'تـ', medial: 'ـتـ', final: 'ـت' },
  },
  {
    position: 4,
    letter: 'ث',
    name_en: 'Tha',
    name_ar: 'ثَاءْ',
    forms: { isolated: 'ث', initial: 'ثـ', medial: 'ـثـ', final: 'ـث' },
  },
  {
    position: 5,
    letter: 'ج',
    name_en: 'Jim',
    name_ar: 'جِيم',
    forms: { isolated: 'ج', initial: 'جـ', medial: 'ـجـ', final: 'ـج' },
  },
  {
    position: 6,
    letter: 'ح',
    name_en: 'Ha',
    name_ar: 'حَاءْ',
    forms: { isolated: 'ح', initial: 'حـ', medial: 'ـحـ', final: 'ـح' },
  },
  {
    position: 7,
    letter: 'خ',
    name_en: 'Kha',
    name_ar: 'خَاءْ',
    forms: { isolated: 'خ', initial: 'خـ', medial: 'ـخـ', final: 'ـخ' },
  },
  {
    position: 8,
    letter: 'د',
    name_en: 'Dal',
    name_ar: 'دَال',
    forms: { isolated: 'د', initial: 'د', medial: 'ـد', final: 'ـد' },
  },
  {
    position: 9,
    letter: 'ذ',
    name_en: 'Dhal',
    name_ar: 'ذَال',
    forms: { isolated: 'ذ', initial: 'ذ', medial: 'ـذ', final: 'ـذ' },
  },
  {
    position: 10,
    letter: 'ر',
    name_en: 'Ra',
    name_ar: 'رَاءْ',
    forms: { isolated: 'ر', initial: 'ر', medial: 'ـر', final: 'ـر' },
  },
  {
    position: 11,
    letter: 'ز',
    name_en: 'Zay',
    name_ar: 'زَاي',
    forms: { isolated: 'ز', initial: 'ز', medial: 'ـز', final: 'ـز' },
  },
  {
    position: 12,
    letter: 'س',
    name_en: 'Sin',
    name_ar: 'سِين',
    forms: { isolated: 'س', initial: 'سـ', medial: 'ـسـ', final: 'ـس' },
  },
  {
    position: 13,
    letter: 'ش',
    name_en: 'Shin',
    name_ar: 'شِين',
    forms: { isolated: 'ش', initial: 'شـ', medial: 'ـشـ', final: 'ـش' },
  },
  {
    position: 14,
    letter: 'ص',
    name_en: 'Sad',
    name_ar: 'صَاد',
    forms: { isolated: 'ص', initial: 'صـ', medial: 'ـصـ', final: 'ـص' },
  },
  {
    position: 15,
    letter: 'ض',
    name_en: 'Dad',
    name_ar: 'ضَاد',
    forms: { isolated: 'ض', initial: 'ضـ', medial: 'ـضـ', final: 'ـض' },
  },
  {
    position: 16,
    letter: 'ط',
    name_en: 'Ta (emphatic)',
    name_ar: 'طَاءْ',
    forms: { isolated: 'ط', initial: 'طـ', medial: 'ـطـ', final: 'ـط' },
  },
  {
    position: 17,
    letter: 'ظ',
    name_en: 'Dha',
    name_ar: 'ظَاءْ',
    forms: { isolated: 'ظ', initial: 'ظـ', medial: 'ـظـ', final: 'ـظ' },
  },
  {
    position: 18,
    letter: 'ع',
    name_en: 'Ain',
    name_ar: 'عَين',
    forms: { isolated: 'ع', initial: 'عـ', medial: 'ـعـ', final: 'ـع' },
  },
  {
    position: 19,
    letter: 'غ',
    name_en: 'Ghain',
    name_ar: 'غَين',
    forms: { isolated: 'غ', initial: 'غـ', medial: 'ـغـ', final: 'ـغ' },
  },
  {
    position: 20,
    letter: 'ف',
    name_en: 'Fa',
    name_ar: 'فَاءْ',
    forms: { isolated: 'ف', initial: 'فـ', medial: 'ـفـ', final: 'ـف' },
  },
  {
    position: 21,
    letter: 'ق',
    name_en: 'Qaf',
    name_ar: 'قَاف',
    forms: { isolated: 'ق', initial: 'قـ', medial: 'ـقـ', final: 'ـق' },
  },
  {
    position: 22,
    letter: 'ك',
    name_en: 'Kaf',
    name_ar: 'كَاف',
    forms: { isolated: 'ك', initial: 'كـ', medial: 'ـكـ', final: 'ـك' },
  },
  {
    position: 23,
    letter: 'ل',
    name_en: 'Lam',
    name_ar: 'لَام',
    forms: { isolated: 'ل', initial: 'لـ', medial: 'ـلـ', final: 'ـل' },
  },
  {
    position: 24,
    letter: 'م',
    name_en: 'Mim',
    name_ar: 'مِيم',
    forms: { isolated: 'م', initial: 'مـ', medial: 'ـمـ', final: 'ـم' },
  },
  {
    position: 25,
    letter: 'ن',
    name_en: 'Nun',
    name_ar: 'نُون',
    forms: { isolated: 'ن', initial: 'نـ', medial: 'ـنـ', final: 'ـن' },
  },
  {
    position: 26,
    letter: 'ه',
    name_en: 'Ha',
    name_ar: 'هَاءْ',
    forms: { isolated: 'ه', initial: 'هـ', medial: 'ـهـ', final: 'ـه' },
  },
  {
    position: 27,
    letter: 'و',
    name_en: 'Waw',
    name_ar: 'وَاو',
    forms: { isolated: 'و', initial: 'و', medial: 'ـو', final: 'ـو' },
  },
  {
    position: 28,
    letter: 'ي',
    name_en: 'Ya',
    name_ar: 'يَاءْ',
    forms: { isolated: 'ي', initial: 'يـ', medial: 'ـيـ', final: 'ـي' },
  },
];

const exerciseSequence = [
  { type: 'listen_tap' as const, order: 1 },
  { type: 'match_name' as const, order: 2 },
  { type: 'tracing' as const, order: 3 },
  { type: 'tap_letter' as const, order: 4 },
];

export async function seedAlphabetTopic() {
  const topic = await Topic.findOneAndUpdate(
    { slug: 'arabic-alphabet' },
    {
      slug: 'arabic-alphabet',
      title_en: 'Arabic Alphabet',
      title_ar: 'الحروف العربية',
      title_de: 'Arabisches Alphabet',
      description_en: 'Learn to read and write the 28 letters of the Arabic alphabet.',
      description_ar: 'تعلم قراءة وكتابة الحروف العربية الثمانية والعشرين.',
      description_de: 'Lerne, die 28 Buchstaben des arabischen Alphabets zu lesen und zu schreiben.',
      icon: '📖',
      color: 'tileGreen',
      category: 'alphabet',
      min_age: 4,
      max_age: 8,
      position: 1,
      is_free: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  console.log(`✅ Upserted topic "${topic.title_en}"`);

  await Letter.deleteMany({});
  await Lesson.deleteMany({ topic_id: topic._id });
  console.log('🗑️  Cleared existing letters and lessons for this topic');

  const insertedLetters = await Letter.insertMany(lettersData);
  console.log(`✅ Inserted ${insertedLetters.length} letters`);

  const lessonsData = insertedLetters.map((letter) => ({
    topic_id: topic._id,
    letter_id: letter._id,
    title_en: `The Letter ${letter.name_en}`,
    title_ar: `حَرف ${letter.name_ar}`,
    title_de: `Der Buchstabe ${letter.name_en}`,
    position: letter.position,
    exercises: exerciseSequence,
    is_free: letter.position <= 5, // First 5 letters are free
  }));

  const insertedLessons = await Lesson.insertMany(lessonsData);
  console.log(`✅ Inserted ${insertedLessons.length} lessons`);
  console.log(`   Free lessons (1–5): ${lessonsData.filter((l) => l.is_free).length}`);
  console.log(`   Premium lessons (6–28): ${lessonsData.filter((l) => !l.is_free).length}`);
}
