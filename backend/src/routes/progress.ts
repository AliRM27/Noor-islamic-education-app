import { Router, Response } from 'express';
import Progress from '../models/Progress';
import User from '../models/User';
import Lesson from '../models/Lesson';
import { authenticateToken, AuthRequest, requireChild } from '../middleware/auth';

const router = Router();

// Coin rewards per star rating
const COINS_BY_STARS: Record<number, number> = { 1: 10, 2: 20, 3: 30 };

// POST /api/progress/complete — submit completed lesson
router.post('/complete', authenticateToken, requireChild, async (req: AuthRequest, res: Response) => {
  try {
    const { lesson_id, accuracy_pct, time_spent_seconds } = req.body;
    const userId = req.user!.id;

    if (!lesson_id || accuracy_pct === undefined) {
      res.status(400).json({ error: 'lesson_id and accuracy_pct are required' });
      return;
    }

    const lesson = await Lesson.findById(lesson_id);
    if (!lesson) { res.status(404).json({ error: 'Lesson not found' }); return; }

    // Calculate stars based on accuracy
    let stars = 1;
    if (accuracy_pct >= 90) stars = 3;
    else if (accuracy_pct >= 70) stars = 2;

    // Count attempts
    const prevAttempts = await Progress.countDocuments({ user_id: userId, lesson_id });

    const progress = new Progress({
      user_id: userId,
      lesson_id,
      topic_id: lesson.topic_id,
      stars,
      accuracy_pct: Math.round(accuracy_pct),
      time_spent_seconds: time_spent_seconds || 0,
      attempt_number: prevAttempts + 1,
    });
    await progress.save();

    // Award coins
    const coinsEarned = COINS_BY_STARS[stars] || 10;

    // Update streak
    const user = await User.findById(userId);
    if (user) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastActivity = user.streak.last_activity_date
        ? new Date(user.streak.last_activity_date)
        : null;

      if (lastActivity) {
        lastActivity.setHours(0, 0, 0, 0);
        const diffDays = Math.floor(
          (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 0) {
          // Already active today — no streak change
        } else if (diffDays === 1) {
          // Consecutive day — extend streak
          user.streak.current += 1;
          if (user.streak.current > user.streak.longest) {
            user.streak.longest = user.streak.current;
          }
          user.streak.last_activity_date = new Date();
        } else {
          // Missed days — reset streak (silently, no negative messaging)
          user.streak.current = 1;
          user.streak.last_activity_date = new Date();
        }
      } else {
        // First activity ever
        user.streak.current = 1;
        user.streak.longest = 1;
        user.streak.last_activity_date = new Date();
      }

      user.coins += coinsEarned;
      await user.save();
    }

    res.status(201).json({
      stars,
      coins_earned: coinsEarned,
      accuracy_pct: Math.round(accuracy_pct),
      streak: user?.streak,
      total_coins: user?.coins,
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/progress/:userId — all progress for a user
router.get('/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    // Users can only see their own progress, unless parent
    if (req.user!.type === 'child' && req.user!.id !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const progress = await Progress.find({ user_id: userId })
      .sort({ completed_at: -1 })
      .populate('lesson_id', 'title_en title_ar position');

    res.json({ progress });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/progress/:userId/streak — streak data
router.get('/:userId/streak', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.userId, 'streak display_name');
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    // Build 7-day activity map for the streak bar
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentProgress = await Progress.find({
      user_id: req.params.userId,
      completed_at: { $gte: sevenDaysAgo },
    }).distinct('completed_at');

    const activeDays = new Set(
      recentProgress.map((d) => {
        const date = new Date(d);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      })
    );

    const weekActivity = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      return { date: d.toISOString().split('T')[0], active: activeDays.has(key) };
    });

    res.json({ streak: user.streak, week_activity: weekActivity });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
