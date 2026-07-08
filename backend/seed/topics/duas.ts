/**
 * Seeds the "Duas" topic — 5 short duas + 5 lessons.
 *
 * ⚠️ DRAFT CONTENT — NOT VERIFIED. The Arabic text, transliteration, and
 * translations below are a starter set for building/testing this feature.
 * They are widely-published, commonly-taught children's duas, but must be
 * reviewed and approved before this is considered real, production content.
 */
import Topic from '../../src/models/Topic';
import Dua from '../../src/models/Dua';
import Lesson from '../../src/models/Lesson';

const duasData = [
  {
    position: 1,
    slug: 'before-eating',
    title_en: 'Before Eating',
    arabic_text: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillah',
    translation_en: 'In the name of Allah',
    occasion_en: 'Before you eat',
    words: ['بِسْمِ', 'اللَّهِ'],
  },
  {
    position: 2,
    slug: 'before-sleeping',
    title_en: 'Before Sleeping',
    arabic_text: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: 'Bismika Allahumma amutu wa ahya',
    translation_en: 'In Your name, O Allah, I die and I live',
    occasion_en: 'Before you go to sleep',
    words: ['بِاسْمِكَ', 'اللَّهُمَّ', 'أَمُوتُ', 'وَأَحْيَا'],
  },
  {
    position: 3,
    slug: 'upon-waking',
    title_en: 'Upon Waking',
    arabic_text: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا وَإِلَيْهِ النُّشُورُ',
    transliteration: "Alhamdu lillahil-ladhi ahyana wa ilayhin-nushur",
    translation_en: 'Praise be to Allah who gives us life, and to Him is the return',
    occasion_en: 'When you wake up',
    words: ['الْحَمْدُ', 'لِلَّهِ', 'الَّذِي', 'أَحْيَانَا', 'وَإِلَيْهِ', 'النُّشُورُ'],
  },
  {
    position: 4,
    slug: 'leaving-the-house',
    title_en: 'Leaving the House',
    arabic_text: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ',
    transliteration: 'Bismillahi tawakkaltu ala Allah',
    translation_en: 'In the name of Allah, I place my trust in Allah',
    occasion_en: 'Before you leave the house',
    words: ['بِسْمِ', 'اللَّهِ', 'تَوَكَّلْتُ', 'عَلَى', 'اللَّهِ'],
  },
  {
    position: 5,
    slug: 'for-parents',
    title_en: 'For Parents',
    arabic_text: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    transliteration: 'Rabbi irhamhuma kama rabbayani sagheera',
    translation_en: 'My Lord, have mercy on them as they raised me when I was small',
    occasion_en: 'When you want to pray for your parents',
    words: ['رَبِّ', 'ارْحَمْهُمَا', 'كَمَا', 'رَبَّيَانِي', 'صَغِيرًا'],
  },
];

const exerciseSequence = [
  { type: 'listen_repeat' as const, order: 1 },
  { type: 'meaning_match' as const, order: 2 },
  { type: 'word_order' as const, order: 3 },
];

export async function seedDuasTopic() {
  const topic = await Topic.findOneAndUpdate(
    { slug: 'duas' },
    {
      slug: 'duas',
      title_en: 'Duas',
      title_ar: 'الأدعية',
      description_en: 'Learn short duas for everyday moments.',
      description_ar: 'تعلم أدعية قصيرة للحظات اليومية.',
      icon: '🤲',
      color: 'tileBlue',
      category: 'basics',
      min_age: 5,
      max_age: 9,
      position: 2,
      is_free: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  console.log(`✅ Upserted topic "${topic.title_en}"`);

  await Dua.deleteMany({});
  await Lesson.deleteMany({ topic_id: topic._id });
  console.log('🗑️  Cleared existing duas and lessons for this topic');

  const insertedDuas = await Dua.insertMany(duasData);
  console.log(`✅ Inserted ${insertedDuas.length} duas`);

  const lessonsData = insertedDuas.map((dua) => ({
    topic_id: topic._id,
    dua_id: dua._id,
    title_en: dua.title_en,
    title_ar: dua.arabic_text,
    position: dua.position,
    exercises: exerciseSequence,
    is_free: dua.position <= 2, // First 2 duas are free
  }));

  const insertedLessons = await Lesson.insertMany(lessonsData);
  console.log(`✅ Inserted ${insertedLessons.length} lessons`);
}
