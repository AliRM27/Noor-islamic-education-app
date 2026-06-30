import { Router, Response } from "express";
import Lesson from "../models/Lesson";
import Letter from "../models/Letter";
import Progress from "../models/Progress";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/lessons — all 28 lessons with lock status for current user
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const lessons = await Lesson.find({})
      .sort({ position: 1 })
      .populate("letter_id");
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Get all completed lesson IDs for this user (best stars per lesson)
    const progressDocs = await Progress.aggregate([
      { $match: { user_id: userId } },
      { $sort: { stars: -1 } },
      { $group: { _id: "$lesson_id", stars: { $first: "$stars" } } },
    ]);
    const progressMap = new Map(
      progressDocs.map((p) => [p._id.toString(), p.stars]),
    );

    const result = lessons.map((lesson) => ({
      _id: lesson._id,
      title_en: lesson.title_en,
      title_ar: lesson.title_ar,
      position: lesson.position,
      is_free: lesson.is_free,
      letter: lesson.letter_id,
      best_stars: progressMap.get(lesson._id.toString()) ?? null,
      is_completed: progressMap.has(lesson._id.toString()),
    }));

    res.json({ lessons: result });
  } catch (error) {
    console.log("Error getting lessons", error);
    res.status(500).json({ error: "Server error" });
  }
});

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
