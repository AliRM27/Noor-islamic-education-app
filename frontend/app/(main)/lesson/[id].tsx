import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Colors, Fonts, Radius, ARABIC_LETTERS } from '../../../src/constants/theme';
import { apiSubmitProgress } from '../../../src/services/api';
import { useUserStore } from '../../../src/store/userStore';

const { width } = Dimensions.get('window');
const CARD_SIZE = width - 64;

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

// ─── Round types ──────────────────────────────────────────────────────────────
// Round 1 — Introduction: show letter + name, play audio
// Round 2 — Listen & Tap: play audio, pick the right letter from 4 choices
// Round 3 — Read & Tap: show name in English, pick the right Arabic letter
// Round 4 — Complete! show stars

type RoundType = 'intro' | 'listenTap' | 'readTap' | 'done';

interface AnswerChoice {
  letter: string;
  nameEn: string;
  isCorrect: boolean;
}

export default function LessonScreen() {
  const router = useRouter();
  const { id, letter, nameEn, nameAr, position } = useLocalSearchParams<{
    id: string; letter: string; nameEn: string; nameAr: string; position: string;
  }>();

  const { markLesson, progress } = useUserStore();

  const [round, setRound] = useState<RoundType>('intro');
  const [choices, setChoices] = useState<AnswerChoice[]>([]);
  const [answered, setAnswered] = useState<boolean | null>(null); // null=unanswered, true=correct, false=wrong
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [startTime] = useState(Date.now());

  // Animation refs
  const cardScale = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const speakLetter = () => {
    Speech.speak(nameEn, { language: 'ar', rate: 0.7 });
  };

  // Build choices for the current round
  const buildChoices = (type: 'listenTap' | 'readTap') => {
    const distractors = getDistractors(letter as string);
    const all: AnswerChoice[] = [
      { letter: letter as string, nameEn: nameEn as string, isCorrect: true },
      ...distractors.map((d) => ({ letter: d.letter, nameEn: d.nameEn, isCorrect: false })),
    ];
    setChoices(shuffle(all));
    setAnswered(null);
  };

  // Start a round
  const startRound = (r: RoundType) => {
    setRound(r);
    setAnswered(null);
    if (r === 'listenTap') {
      buildChoices('listenTap');
      setTimeout(speakLetter, 400);
    } else if (r === 'readTap') {
      buildChoices('readTap');
    } else if (r === 'done') {
      const accuracy = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 100;
      const stars = accuracy >= 90 ? 3 : accuracy >= 60 ? 2 : 1;
      const timeSeconds = Math.round((Date.now() - startTime) / 1000);
      markLesson(id as string, stars);
      apiSubmitProgress(id as string, stars, accuracy, timeSeconds);
    }
  };

  useEffect(() => { startRound('intro'); }, []);

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

  const handleAnswer = (choice: AnswerChoice) => {
    if (answered !== null) return; // already answered
    setTotalAnswers((n) => n + 1);
    if (choice.isCorrect) {
      setCorrectCount((n) => n + 1);
      setAnswered(true);
      popCard();
      // Auto-advance after 900ms
      setTimeout(() => {
        if (round === 'listenTap') startRound('readTap');
        else startRound('done');
      }, 900);
    } else {
      setAnswered(false);
      shakeCard();
      setTimeout(() => setAnswered(null), 800);
    }
  };

  const stars = totalAnswers > 0
    ? Math.round((correctCount / totalAnswers) * 100) >= 90 ? 3
    : Math.round((correctCount / totalAnswers) * 100) >= 60 ? 2 : 1
    : 3;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={s.safe}>

      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.closeBtn} onPress={() => { Speech.stop(); router.back(); }}>
          <Ionicons name="close" size={26} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={s.positionText}>Letter {position} of 28</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* ── INTRO ─────────────────────────────────────────────────────────── */}
      {round === 'intro' && (
        <View style={s.content}>
          <Animated.View
            style={[s.letterCard, { backgroundColor: Colors.tileYellow, transform: [{ scale: cardScale }, { translateX: shakeAnim }] }]}
          >
            <Text style={s.bigLetter}>{letter}</Text>
            <Text style={s.letterNameAr}>{nameAr}</Text>
          </Animated.View>

          <Text style={s.letterNameEn}>{nameEn}</Text>

          <TouchableOpacity style={s.speakBtn} onPress={speakLetter} activeOpacity={0.7}>
            <Ionicons name="volume-high" size={28} color={Colors.white} />
            <Text style={s.speakBtnText}>Tap to hear</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.continueBtn} onPress={() => startRound('listenTap')} activeOpacity={0.8}>
            <Text style={s.continueBtnText}>I'm ready! →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── LISTEN & TAP ─────────────────────────────────────────────────── */}
      {round === 'listenTap' && (
        <View style={s.content}>
          <Text style={s.questionText}>Tap the letter you hear 👂</Text>

          <TouchableOpacity style={s.playAgainBtn} onPress={speakLetter} activeOpacity={0.7}>
            <Ionicons name="volume-high" size={36} color={Colors.green} />
          </TouchableOpacity>

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
                <Text style={s.choiceLetter}>{c.letter}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ── READ & TAP ───────────────────────────────────────────────────── */}
      {round === 'readTap' && (
        <View style={s.content}>
          <Text style={s.questionText}>Which letter is "{nameEn}"? 🤔</Text>

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
                <Text style={s.choiceLetter}>{c.letter}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ── DONE ─────────────────────────────────────────────────────────── */}
      {round === 'done' && (
        <View style={s.content}>
          <Text style={s.doneEmoji}>🎉</Text>
          <Text style={s.doneTitle}>Great job!</Text>
          <Text style={s.doneSubtitle}>You learned the letter {nameEn}</Text>

          {/* Stars */}
          <View style={s.starsRow}>
            {[1, 2, 3].map((i) => (
              <Text key={i} style={[s.star, { color: i <= stars ? Colors.gold : '#E0E0E0' }]}>
                ★
              </Text>
            ))}
          </View>

          <TouchableOpacity
            style={s.continueBtn}
            onPress={() => { Speech.stop(); router.back(); }}
            activeOpacity={0.8}
          >
            <Text style={s.continueBtnText}>Back to letters →</Text>
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
    height: CARD_SIZE * 0.7,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bigLetter: {
    fontFamily: Fonts.arabicBold,
    fontSize: 110,
    color: Colors.textDark,
    textAlign: 'center',
  },
  letterNameAr: {
    fontFamily: Fonts.arabicBold,
    fontSize: 22,
    color: Colors.textMedium,
    writingDirection: 'rtl',
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
