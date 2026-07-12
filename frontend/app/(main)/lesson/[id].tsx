import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, ActivityIndicator, PanResponder,
} from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Colors, Fonts, Radius, ARABIC_LETTERS } from '../../../src/constants/theme';
import { apiGetLessonExercises, apiSubmitProgress, ApiExercise } from '../../../src/services/api';
import { useUserStore } from '../../../src/store/userStore';
import { t, TranslationKey } from '../../../src/i18n';
import { pick } from '../../../src/i18n/localizeContent';

const { width } = Dimensions.get('window');
const CARD_SIZE = width - 64;

const SUPPORTED_TYPES: ApiExercise['type'][] = [
  'listen_tap', 'match_name', 'tracing', 'tap_letter',
  'listen_repeat', 'meaning_match', 'word_order',
];

interface Point { x: number; y: number }

type Position = 'isolated' | 'initial' | 'medial' | 'final';
const POSITION_ORDER: Position[] = ['isolated', 'initial', 'medial', 'final'];

const POSITION_LABEL_KEYS: Record<Position, TranslationKey> = {
  isolated: 'positionAlone',
  initial: 'positionStart',
  medial: 'positionMiddle',
  final: 'positionEnd',
};

const FORM_LABEL_KEYS: Record<Position, TranslationKey> = {
  isolated: 'formAlone',
  initial: 'formStart',
  medial: 'formMiddle',
  final: 'formEnd',
};

// A match_name exercise from the API covers all 4 positions at once — we split it
// into one step per position so a lesson asks about all of them, not just one.
type MatchNameApi = Extract<ApiExercise, { type: 'match_name' }>;
type Step = Exclude<ApiExercise, MatchNameApi> | (MatchNameApi & { targetPosition: Position });

function expandSteps(list: ApiExercise[]): Step[] {
  const steps: Step[] = [];
  for (const ex of list) {
    if (ex.type === 'match_name') {
      for (const pos of shuffle(POSITION_ORDER)) {
        steps.push({ ...ex, targetPosition: pos });
      }
    } else {
      steps.push(ex);
    }
  }
  return steps;
}

// Pick 3 random wrong answers from the alphabet
function getDistractors(correctLetter: string, count = 3): typeof ARABIC_LETTERS {
  const pool = ARABIC_LETTERS.filter((l) => l.letter !== correctLetter);
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Shuffle an array
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─── Phases ───────────────────────────────────────────────────────────────────
// loading  — fetching the real exercise list
// intro    — show letter + name, play audio
// exercise — run through exercises[stepIndex] one at a time
// done     — show stars
// empty    — nothing to show (offline + no local fallback for this lesson)

type Phase = 'loading' | 'intro' | 'exercise' | 'done' | 'empty';

interface AnswerChoice {
  key: string;
  display: string;
  isCorrect: boolean;
}

export default function LessonScreen() {
  const router = useRouter();
  const { id, letter, nameEn, nameAr } = useLocalSearchParams<{
    id: string; letter: string; nameEn: string; nameAr: string;
  }>();

  const { markLesson, locale } = useUserStore();

  const [phase, setPhase] = useState<Phase>('loading');
  const [exercises, setExercises] = useState<Step[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [choices, setChoices] = useState<AnswerChoice[]>([]);
  const [promptLabel, setPromptLabel] = useState('');
  const [answered, setAnswered] = useState<boolean | null>(null); // null=unanswered, true=correct, false=wrong
  const [finalStars, setFinalStars] = useState(3);
  const [startTime, setStartTime] = useState(Date.now());

  // Tracing exercise
  const [completedStrokes, setCompletedStrokes] = useState<Point[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [tracingHint, setTracingHint] = useState(false);

  // Word-order exercise
  const [wordBank, setWordBank] = useState<{ word: string; used: boolean }[]>([]);
  const [filledWords, setFilledWords] = useState<string[]>([]);

  // Letter forms (isolated/initial/medial/final), shown on the intro screen
  // when available — pulled from the match_name exercise, alphabet lessons only.
  const [letterForms, setLetterForms] = useState<Record<Position, string> | null>(null);

  const correctCountRef = useRef(0);
  const totalAnswersRef = useRef(0);

  const tracePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentStroke([{ x: locationX, y: locationY }]);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentStroke((pts) => [...pts, { x: locationX, y: locationY }]);
      },
      onPanResponderRelease: () => {
        setCurrentStroke((pts) => {
          if (pts.length > 1) setCompletedStrokes((strokes) => [...strokes, pts]);
          return [];
        });
      },
    }),
  ).current;

  // Animation refs
  const cardScale = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const speakLetter = () => {
    // Speak the actual Arabic name, not the English transliteration — an Arabic
    // voice reading Latin text like "Alif" phonetically comes out mangled.
    Speech.speak(nameAr, { language: 'ar', rate: 0.7 });
  };

  // Fetch the real exercise list; fall back to a minimal offline sequence.
  // Keyed off `id` (not mount-once) and resets all per-lesson state, since
  // expo-router can reuse this screen instance across lesson-to-lesson
  // navigations rather than always unmounting/remounting it.
  useEffect(() => {
    setPhase('loading');
    setExercises([]);
    setStepIndex(0);
    setChoices([]);
    setPromptLabel('');
    setAnswered(null);
    setFinalStars(3);
    setStartTime(Date.now());
    setLetterForms(null);
    setCompletedStrokes([]);
    setCurrentStroke([]);
    setTracingHint(false);
    setWordBank([]);
    setFilledWords([]);
    correctCountRef.current = 0;
    totalAnswersRef.current = 0;

    (async () => {
      let list: ApiExercise[] = [];
      try {
        const fetched = await apiGetLessonExercises(id);
        list = fetched.filter((e) => SUPPORTED_TYPES.includes(e.type));
      } catch {
        // offline — fall through to the local fallback below
      }
      // Local fallback only exists for alphabet lessons (route params carry a
      // single letter) — there's no equivalent offline content for Duas.
      if (list.length === 0 && letter) {
        list = [
          { type: 'listen_tap', order: 1, letter: letter as string, name_en: nameEn as string, name_ar: nameAr as string, audio_url: '' },
          { type: 'tracing', order: 2, letter: letter as string, name_en: nameEn as string, svg_path: '' },
          { type: 'tap_letter', order: 3, letter: letter as string, name_en: nameEn as string, name_ar: nameAr as string },
        ];
      }
      if (list.length === 0) {
        setPhase('empty');
        return;
      }
      const matchNameEx = list.find((e) => e.type === 'match_name');
      if (matchNameEx?.type === 'match_name') setLetterForms(matchNameEx.forms);
      setExercises(expandSteps(list));
      setPhase('intro');
    })();
  }, [id]);

  // Animate card pop on correct
  const popCard = () => {
    Animated.sequence([
      Animated.spring(cardScale, { toValue: 1.06, useNativeDriver: true, tension: 200 }),
      Animated.spring(cardScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  // Animate shake on wrong
  const shakeCard = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  // Build the answer choices for a given exercise
  const startExercise = (ex: Step) => {
    setAnswered(null);
    if (ex.type === 'listen_tap' || ex.type === 'tap_letter') {
      const distractors = getDistractors(ex.letter);
      const all: AnswerChoice[] = [
        { key: ex.letter, display: ex.letter, isCorrect: true },
        ...distractors.map((d) => ({ key: d.letter, display: d.letter, isCorrect: false })),
      ];
      setChoices(shuffle(all));
      if (ex.type === 'listen_tap') setTimeout(speakLetter, 400);
    } else if (ex.type === 'match_name') {
      const target = ex.targetPosition;
      const correctGlyph = ex.forms[target];

      // Some letters don't connect to the next one, so two of their four forms
      // are visually identical (e.g. Alif's isolated === initial). Only use the
      // letter's own forms as wrong choices when they're actually distinct —
      // pad the rest from other letters so all 4 tiles always look different.
      const sameLetterAlts = Array.from(new Set(
        POSITION_ORDER.filter((p) => p !== target && ex.forms[p] !== correctGlyph).map((p) => ex.forms[p]),
      )).slice(0, 3);

      const usedGlyphs = new Set([correctGlyph, ...sameLetterAlts]);
      const fillers = getDistractors(ex.letter, 6)
        .map((l) => l.letter)
        .filter((g) => !usedGlyphs.has(g));
      const wrongGlyphs = [...sameLetterAlts, ...fillers].slice(0, 3);

      const all: AnswerChoice[] = [
        { key: 'correct', display: correctGlyph, isCorrect: true },
        ...wrongGlyphs.map((g, i) => ({ key: `wrong-${i}`, display: g, isCorrect: false })),
      ];
      setChoices(shuffle(all));
      setPromptLabel(t(POSITION_LABEL_KEYS[target]));
    } else if (ex.type === 'tracing') {
      setCompletedStrokes([]);
      setCurrentStroke([]);
      setTracingHint(false);
    } else if (ex.type === 'meaning_match') {
      const correctOccasion = pick(locale, ex.correct_occasion, ex.correct_occasion_de);
      const distractorOccasions = locale === 'de' ? ex.distractor_occasions_de : ex.distractor_occasions;
      const all: AnswerChoice[] = [
        { key: 'correct', display: correctOccasion, isCorrect: true },
        ...distractorOccasions.map((occ, i) => ({ key: `wrong-${i}`, display: occ, isCorrect: false })),
      ];
      setChoices(shuffle(all));
    } else if (ex.type === 'word_order') {
      setWordBank(shuffle(ex.words).map((word) => ({ word, used: false })));
      setFilledWords([]);
    }
  };

  const beginExercises = () => {
    setPhase('exercise');
    setStepIndex(0);
    startExercise(exercises[0]);
  };

  const finishLesson = () => {
    const accuracy = totalAnswersRef.current > 0
      ? Math.round((correctCountRef.current / totalAnswersRef.current) * 100)
      : 100;
    const stars = accuracy >= 90 ? 3 : accuracy >= 60 ? 2 : 1;
    const timeSeconds = Math.round((Date.now() - startTime) / 1000);
    setFinalStars(stars);
    setPhase('done');
    markLesson(id, stars);
    apiSubmitProgress(id, stars, accuracy, timeSeconds);
  };

  const goToNextOrDone = () => {
    const next = stepIndex + 1;
    if (next < exercises.length) {
      setStepIndex(next);
      startExercise(exercises[next]);
    } else {
      finishLesson();
    }
  };

  const handleAnswer = (choice: AnswerChoice) => {
    if (answered !== null) return; // already answered
    totalAnswersRef.current += 1;
    if (choice.isCorrect) {
      correctCountRef.current += 1;
      setAnswered(true);
      popCard();
      // Auto-advance after 900ms
      setTimeout(goToNextOrDone, 900);
    } else {
      setAnswered(false);
      shakeCard();
      setTimeout(() => setAnswered(null), 800);
    }
  };

  // Simplified grading: no real stroke-path data exists yet, so this can't check
  // shape accuracy — only that the child drew a real stroke spanning a good part
  // of the box, not a tap or a scribble confined to one small spot. Using the
  // longer of width/height (not both) means thin/elongated letters like Alif — a
  // single near-vertical line with almost no horizontal extent — aren't unfairly
  // failed for having low "width" coverage when traced correctly.
  const evaluateTracing = () => {
    const points = completedStrokes.flat();
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const coverW = xs.length ? Math.max(...xs) - Math.min(...xs) : 0;
    const coverH = ys.length ? Math.max(...ys) - Math.min(...ys) : 0;
    const traced = points.length >= 8 && Math.max(coverW, coverH) >= CARD_SIZE * 0.5;

    if (!traced) {
      setTracingHint(true);
      shakeCard();
      setTimeout(() => setTracingHint(false), 800);
      return;
    }
    totalAnswersRef.current += 1;
    correctCountRef.current += 1;
    popCard();
    setTimeout(goToNextOrDone, 900);
  };

  // listen_repeat isn't gradable without speech recognition — tapping the
  // confirm button always counts as correct, same spirit as a real repeat-after-me drill.
  const confirmListenRepeat = () => {
    totalAnswersRef.current += 1;
    correctCountRef.current += 1;
    popCard();
    setTimeout(goToNextOrDone, 900);
  };

  const tapWordChip = (index: number) => {
    if (currentExercise?.type !== 'word_order') return;
    const chip = wordBank[index];
    if (chip.used) return;
    const expectedWord = currentExercise.words[filledWords.length];
    if (chip.word !== expectedWord) {
      shakeCard();
      return;
    }
    setWordBank((bank) => bank.map((c, i) => (i === index ? { ...c, used: true } : c)));
    const newFilled = [...filledWords, chip.word];
    setFilledWords(newFilled);
    if (newFilled.length === currentExercise.words.length) {
      totalAnswersRef.current += 1;
      correctCountRef.current += 1;
      popCard();
      setTimeout(goToNextOrDone, 900);
    }
  };

  const currentExercise = exercises[stepIndex];
  const headerText = phase === 'exercise' && currentExercise
    ? t('stepOf', { n: stepIndex + 1, total: exercises.length })
    : nameEn;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={s.safe}>

      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.closeBtn} onPress={() => { Speech.stop(); router.back(); }}>
          <Ionicons name="close" size={26} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={s.positionText}>{headerText}</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* ── LOADING ───────────────────────────────────────────────────────── */}
      {phase === 'loading' && (
        <View style={s.content}>
          <ActivityIndicator size="large" color={Colors.green} />
        </View>
      )}

      {/* ── INTRO ─────────────────────────────────────────────────────────── */}
      {phase === 'intro' && (
        <View style={s.content}>
          <Animated.View
            style={[s.letterCard, { backgroundColor: Colors.tileYellow, transform: [{ scale: cardScale }, { translateX: shakeAnim }] }]}
          >
            {letter ? (
              <Text style={s.bigLetter}>{letter}</Text>
            ) : (
              <Text style={s.duaIntroText}>{nameAr}</Text>
            )}
          </Animated.View>

          {letter ? (
            <View style={s.nameRow}>
              <Text style={s.letterNameEn}>{nameEn}</Text>
              <Text style={s.letterNameArBig}>{nameAr}</Text>
            </View>
          ) : (
            <Text style={s.letterNameEn}>{nameEn}</Text>
          )}

          {letterForms && (
            <View style={s.formsCard}>
              <Text style={s.formsTitle}>{t('howToSpell')}</Text>
              <View style={s.formsRow}>
                {POSITION_ORDER.map((pos) => (
                  <View key={pos} style={s.formItem}>
                    <Text style={s.formGlyph}>{letterForms[pos]}</Text>
                    <Text style={s.formLabel}>{t(FORM_LABEL_KEYS[pos])}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity style={s.speakBtn} onPress={speakLetter} activeOpacity={0.7}>
            <Ionicons name="volume-high" size={28} color={Colors.white} />
            <Text style={s.speakBtnText}>{t('tapToHear')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.continueBtn} onPress={beginExercises} activeOpacity={0.8}>
            <Text style={s.continueBtnText}>{t('imReady')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── EXERCISE ──────────────────────────────────────────────────────── */}
      {phase === 'exercise' && currentExercise && (
        <View style={s.content}>
          {currentExercise.type === 'listen_tap' && (
            <>
              <Text style={s.questionText}>{t('tapLetterYouHear')}</Text>
              <TouchableOpacity style={s.playAgainBtn} onPress={speakLetter} activeOpacity={0.7}>
                <Ionicons name="volume-high" size={36} color={Colors.green} />
              </TouchableOpacity>
            </>
          )}

          {currentExercise.type === 'tap_letter' && (
            <Text style={s.questionText}>{t('whichLetterIs', { name: currentExercise.name_en })}</Text>
          )}

          {currentExercise.type === 'match_name' && (
            <Text style={s.questionText}>{t('tapFormUsed', { label: promptLabel })}</Text>
          )}

          {currentExercise.type === 'tracing' && (
            <Text style={s.questionText}>{t('traceTheLetter')}</Text>
          )}

          {currentExercise.type === 'listen_repeat' && (
            <Text style={s.questionText}>{t('listenAndRepeat')}</Text>
          )}

          {currentExercise.type === 'meaning_match' && (
            <>
              <Text style={s.duaContextText}>{currentExercise.arabic_text}</Text>
              <Text style={s.questionText}>{t('whenDoYouSay')}</Text>
            </>
          )}

          {currentExercise.type === 'word_order' && (
            <Text style={s.questionText}>{t('putWordsInOrder')}</Text>
          )}

          {(currentExercise.type === 'listen_tap' || currentExercise.type === 'tap_letter'
            || currentExercise.type === 'match_name' || currentExercise.type === 'meaning_match') && (
            <View style={s.choicesGrid}>
              {choices.map((c, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    s.choice,
                    answered === true && c.isCorrect && s.choiceCorrect,
                    answered === false && c.isCorrect && s.choiceCorrect,
                    answered === false && !c.isCorrect && s.choiceWrong,
                  ]}
                  onPress={() => handleAnswer(c)}
                  activeOpacity={0.75}
                >
                  <Text style={currentExercise.type === 'meaning_match' ? s.choiceText : s.choiceLetter}>
                    {c.display}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {currentExercise.type === 'tracing' && (
            <>
              <View style={s.traceBox} {...tracePanResponder.panHandlers}>
                <Text style={s.traceGuide}>{currentExercise.letter}</Text>
                <Svg style={StyleSheet.absoluteFill} width={CARD_SIZE} height={CARD_SIZE}>
                  {[...completedStrokes, currentStroke].map((strokePoints, i) => (
                    strokePoints.length > 1 && (
                      <Polyline
                        key={i}
                        points={strokePoints.map((p) => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke={Colors.green}
                        strokeWidth={10}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )
                  ))}
                </Svg>
              </View>

              {tracingHint && <Text style={s.traceHint}>{t('traceMoreFirst')}</Text>}

              <View style={s.traceButtonRow}>
                <TouchableOpacity
                  style={s.clearBtn}
                  onPress={() => { setCompletedStrokes([]); setCurrentStroke([]); }}
                  activeOpacity={0.7}
                >
                  <Text style={s.clearBtnText}>{t('clear')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.doneTracingBtn} onPress={evaluateTracing} activeOpacity={0.8}>
                  <Text style={s.continueBtnText}>{t('doneTracing')}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {currentExercise.type === 'listen_repeat' && (
            <>
              <TouchableOpacity style={s.playAgainBtn} onPress={speakLetter} activeOpacity={0.7}>
                <Ionicons name="volume-high" size={36} color={Colors.green} />
              </TouchableOpacity>
              <Text style={s.transliterationText}>{currentExercise.transliteration}</Text>
              <TouchableOpacity style={s.continueBtn} onPress={confirmListenRepeat} activeOpacity={0.8}>
                <Text style={s.continueBtnText}>{t('iRepeatedIt')}</Text>
              </TouchableOpacity>
            </>
          )}

          {currentExercise.type === 'word_order' && (
            <>
              <View style={s.targetRow}>
                {currentExercise.words.map((_, i) => (
                  <View key={i} style={s.targetSlot}>
                    <Text style={s.targetSlotText}>{filledWords[i] ?? ''}</Text>
                  </View>
                ))}
              </View>
              <View style={s.wordBank}>
                {wordBank.map((chip, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[s.wordChip, chip.used && s.wordChipUsed]}
                    onPress={() => tapWordChip(i)}
                    activeOpacity={0.75}
                    disabled={chip.used}
                  >
                    <Text style={s.wordChipText}>{chip.word}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      )}

      {/* ── EMPTY ─────────────────────────────────────────────────────────── */}
      {phase === 'empty' && (
        <View style={s.content}>
          <Text style={s.doneEmoji}>📡</Text>
          <Text style={s.doneSubtitle}>{t('couldNotLoadLesson')}</Text>
          <TouchableOpacity style={s.continueBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={s.continueBtnText}>{t('back')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── DONE ─────────────────────────────────────────────────────────── */}
      {phase === 'done' && (
        <View style={s.content}>
          <Text style={s.doneEmoji}>🎉</Text>
          <Text style={s.doneTitle}>{t('greatJob')}</Text>
          <Text style={s.doneSubtitle}>{t('youLearned', { name: nameEn })}</Text>

          {/* Stars */}
          <View style={s.starsRow}>
            {[1, 2, 3].map((i) => (
              <Text key={i} style={[s.star, { color: i <= finalStars ? Colors.gold : '#E0E0E0' }]}>
                ★
              </Text>
            ))}
          </View>

          <TouchableOpacity
            style={s.continueBtn}
            onPress={() => { Speech.stop(); router.back(); }}
            activeOpacity={0.8}
          >
            <Text style={s.continueBtnText}>{t('backToLessons')}</Text>
          </TouchableOpacity>
        </View>
      )}

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeBtn: {
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  positionText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.textMedium,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  questionText: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.textDark,
    textAlign: 'center',
  },
  // Intro card
  letterCard: {
    width: CARD_SIZE,
    minHeight: CARD_SIZE * 0.45,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    gap: 8,
  },
  bigLetter: {
    fontFamily: Fonts.arabicBold,
    fontSize: 110,
    color: Colors.textDark,
    textAlign: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 14,
  },
  letterNameArBig: {
    fontFamily: Fonts.arabicBold,
    fontSize: 30,
    color: Colors.textMedium,
    writingDirection: 'rtl',
  },
  formsCard: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: 14,
    gap: 10,
  },
  formsTitle: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.textMedium,
    textAlign: 'center',
  },
  formsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  formItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    borderRadius: Radius.sm,
    paddingVertical: 10,
  },
  formGlyph: {
    fontFamily: Fonts.arabicBold,
    fontSize: 30,
    color: Colors.textDark,
  },
  formLabel: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: Colors.textMedium,
  },
  duaIntroText: {
    fontFamily: Fonts.arabicBold,
    fontSize: 36,
    color: Colors.textDark,
    textAlign: 'center',
    writingDirection: 'rtl',
    paddingHorizontal: 16,
  },
  duaContextText: {
    fontFamily: Fonts.arabicBold,
    fontSize: 28,
    color: Colors.textDark,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  transliterationText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textMedium,
    textAlign: 'center',
  },
  letterNameEn: {
    fontFamily: Fonts.extraBold,
    fontSize: 28,
    color: Colors.textDark,
  },
  speakBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.green,
    borderRadius: Radius.full,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  speakBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.white,
  },
  continueBtn: {
    backgroundColor: Colors.green,
    borderRadius: Radius.xl,
    paddingVertical: 18,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  continueBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.white,
  },
  // Listen round
  playAgainBtn: {
    width: 90, height: 90,
    borderRadius: 45,
    backgroundColor: Colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Answer grid: 2×2
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
    width: '100%',
  },
  choice: {
    width: (width - 48 - 14) / 2,
    height: (width - 48 - 14) / 2,
    borderRadius: Radius.lg,
    backgroundColor: Colors.answerIdle,
    borderWidth: 2,
    borderColor: Colors.answerBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceCorrect: {
    backgroundColor: Colors.greenLight,
    borderColor: Colors.correct,
  },
  choiceWrong: {
    backgroundColor: '#FFE8E8',
    borderColor: Colors.wrong,
  },
  choiceLetter: {
    fontFamily: Fonts.arabicBold,
    fontSize: 52,
    color: Colors.textDark,
    textAlign: 'center',
  },
  choiceText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.textDark,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  // Word order
  targetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    width: '100%',
  },
  targetSlot: {
    minWidth: 56,
    height: 48,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.answerBorder,
    backgroundColor: Colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  targetSlotText: {
    fontFamily: Fonts.arabicBold,
    fontSize: 20,
    color: Colors.textDark,
  },
  wordBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    width: '100%',
  },
  wordChip: {
    borderRadius: Radius.md,
    backgroundColor: Colors.answerIdle,
    borderWidth: 2,
    borderColor: Colors.answerBorder,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  wordChipUsed: {
    opacity: 0.3,
  },
  wordChipText: {
    fontFamily: Fonts.arabicBold,
    fontSize: 20,
    color: Colors.textDark,
  },
  // Tracing
  traceBox: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: Radius.xl,
    backgroundColor: Colors.background,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  traceGuide: {
    fontFamily: Fonts.arabicBold,
    fontSize: 160,
    color: Colors.textDark,
    opacity: 0.18,
    textAlign: 'center',
  },
  traceHint: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.wrong,
  },
  traceButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  clearBtn: {
    flex: 1,
    backgroundColor: Colors.answerIdle,
    borderRadius: Radius.xl,
    paddingVertical: 16,
    alignItems: 'center',
  },
  clearBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.textDark,
  },
  doneTracingBtn: {
    flex: 2,
    backgroundColor: Colors.green,
    borderRadius: Radius.xl,
    paddingVertical: 16,
    alignItems: 'center',
  },
  // Done
  doneEmoji: { fontSize: 72 },
  doneTitle: {
    fontFamily: Fonts.extraBold,
    fontSize: 36,
    color: Colors.textDark,
  },
  doneSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    color: Colors.textMedium,
    textAlign: 'center',
  },
  starsRow: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 48 },
});
