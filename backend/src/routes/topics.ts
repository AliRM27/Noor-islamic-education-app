import { Router, Response } from "express";
import mongoose from "mongoose";
import Topic from "../models/Topic";
import Lesson from "../models/Lesson";
import Progress from "../models/Progress";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/topics — all topics with lesson/completion counts for current user
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const topics = await Topic.find({}).sort({ position: 1 });

    const lessonCounts = await Lesson.aggregate([
      { $group: { _id: "$topic_id", count: { $sum: 1 } } },
    ]);
    const lessonCountMap = new Map(
      lessonCounts.map((l) => [l._id.toString(), l.count]),
    );

    const completedCounts = await Progress.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
      // Only count progress whose lesson still exists — reseeding recreates
      // lessons with new ids, orphaning old progress records otherwise.
      { $lookup: { from: "lessons", localField: "lesson_id", foreignField: "_id", as: "lesson" } },
      { $match: { lesson: { $ne: [] } } },
      { $group: { _id: { topic_id: "$topic_id", lesson_id: "$lesson_id" } } },
      { $group: { _id: "$_id.topic_id", count: { $sum: 1 } } },
    ]);
    const completedCountMap = new Map(
      completedCounts.map((c) => [c._id.toString(), c.count]),
    );

    const result = topics.map((topic) => ({
      _id: topic._id,
      slug: topic.slug,
      title_en: topic.title_en,
      title_ar: topic.title_ar,
      title_de: topic.title_de,
      description_en: topic.description_en,
      description_ar: topic.description_ar,
      description_de: topic.description_de,
      icon: topic.icon,
      color: topic.color,
      category: topic.category,
      min_age: topic.min_age,
      max_age: topic.max_age,
      is_free: topic.is_free,
      lesson_count: lessonCountMap.get(topic._id.toString()) ?? 0,
      completed_count: completedCountMap.get(topic._id.toString()) ?? 0,
    }));

    res.json({ topics: result });
  } catch (error) {
    console.log("Error getting topics", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/topics/:id/lessons — lessons within a topic, with lock status for current user
router.get(
  "/:id/lessons",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const lessons = await Lesson.find({ topic_id: req.params.id })
        .sort({ position: 1 })
        .populate("letter_id")
        .populate("dua_id");

      const progressDocs = await Progress.aggregate([
        { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
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
        title_de: lesson.title_de,
        position: lesson.position,
        is_free: lesson.is_free,
        letter: lesson.letter_id ?? undefined,
        dua: lesson.dua_id ?? undefined,
        best_stars: progressMap.get(lesson._id.toString()) ?? null,
        is_completed: progressMap.has(lesson._id.toString()),
      }));

      res.json({ lessons: result });
    } catch (error) {
      console.log("Error getting topic lessons", error);
      res.status(500).json({ error: "Server error" });
    }
  },
);

export default router;
