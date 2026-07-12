import { Router, Response } from "express";
import Lesson from "../models/Lesson";
import Letter from "../models/Letter";
import Dua from "../models/Dua";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/lessons/:id — single lesson with letter detail
router.get(
  "/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const lesson = await Lesson.findById(req.params.id)
        .populate("letter_id")
        .populate("dua_id");
      if (!lesson) {
        res.status(404).json({ error: "Lesson not found" });
        return;
      }
      res.json({ lesson });
    } catch {
      res.status(500).json({ error: "Server error" });
    }
  },
);

// GET /api/lessons/:id/exercises — exercise content for a lesson
router.get(
  "/:id/exercises",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const lesson = await Lesson.findById(req.params.id)
        .populate<{ letter_id: InstanceType<typeof Letter> }>("letter_id")
        .populate<{ dua_id: InstanceType<typeof Dua> }>("dua_id");
      if (!lesson) {
        res.status(404).json({ error: "Lesson not found" });
        return;
      }

      const letter = lesson.letter_id as any;
      const dua = lesson.dua_id as any;

      // meaning_match needs wrong-answer occasions from other duas — fetch once
      // up front only if this lesson actually has a meaning_match exercise.
      let distractorOccasionsEn: string[] = [];
      let distractorOccasionsDe: string[] = [];
      if (dua && lesson.exercises.some((ex) => ex.type === "meaning_match")) {
        const others = await Dua.find({ _id: { $ne: dua._id } })
          .limit(2)
          .select("occasion_en occasion_de");
        distractorOccasionsEn = others.map((d) => d.occasion_en);
        distractorOccasionsDe = others.map((d) => d.occasion_de);
      }

      // Build exercise payloads — client uses these to render exercises
      const exercises = lesson.exercises
        .sort((a, b) => a.order - b.order)
        .map((ex) => {
          switch (ex.type) {
            case "listen_tap":
              return {
                type: "listen_tap",
                order: ex.order,
                letter: letter.letter,
                name_en: letter.name_en,
                name_ar: letter.name_ar,
                audio_url: letter.audio_url,
              };
            case "match_name":
              return {
                type: "match_name",
                order: ex.order,
                letter: letter.letter,
                name_en: letter.name_en,
                name_ar: letter.name_ar,
                forms: letter.forms,
              };
            case "tracing":
              return {
                type: "tracing",
                order: ex.order,
                letter: letter.letter,
                name_en: letter.name_en,
                svg_path: letter.svg_path,
              };
            case "tap_letter":
              return {
                type: "tap_letter",
                order: ex.order,
                letter: letter.letter,
                name_en: letter.name_en,
                name_ar: letter.name_ar,
              };
            case "listen_repeat":
              return {
                type: "listen_repeat",
                order: ex.order,
                arabic_text: dua.arabic_text,
                transliteration: dua.transliteration,
                audio_url: dua.audio_url,
              };
            case "meaning_match":
              return {
                type: "meaning_match",
                order: ex.order,
                arabic_text: dua.arabic_text,
                correct_occasion: dua.occasion_en,
                correct_occasion_de: dua.occasion_de,
                distractor_occasions: distractorOccasionsEn,
                distractor_occasions_de: distractorOccasionsDe,
              };
            case "word_order":
              return {
                type: "word_order",
                order: ex.order,
                arabic_text: dua.arabic_text,
                words: dua.words,
              };
            default:
              return ex;
          }
        });

      res.json({ lesson_id: lesson._id, exercises });
    } catch {
      res.status(500).json({ error: "Server error" });
    }
  },
);

export default router;
