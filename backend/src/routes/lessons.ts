import { Router, Response } from "express";
import Lesson from "../models/Lesson";
import Letter from "../models/Letter";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/lessons/:id — single lesson with letter detail
router.get(
  "/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const lesson = await Lesson.findById(req.params.id).populate("letter_id");
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
      const lesson = await Lesson.findById(req.params.id).populate<{
        letter_id: InstanceType<typeof Letter>;
      }>("letter_id");
      if (!lesson) {
        res.status(404).json({ error: "Lesson not found" });
        return;
      }

      const letter = lesson.letter_id as any;

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
