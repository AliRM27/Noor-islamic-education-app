import { Router, Response } from 'express';
import Parent from '../models/Parent';
import User from '../models/User';
import Progress from '../models/Progress';
import { authenticateToken, AuthRequest, requireParent } from '../middleware/auth';

const router = Router();

// GET /api/parent/children — list all linked child profiles
router.get('/children', authenticateToken, requireParent, async (req: AuthRequest, res: Response) => {
  try {
    const parent = await Parent.findById(req.user!.id).populate(
      'children',
      '-pin_hash'
    );
    if (!parent) { res.status(404).json({ error: 'Parent not found' }); return; }
    res.json({ children: parent.children });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/parent/children/:id — child progress summary
router.get('/children/:id', authenticateToken, requireParent, async (req: AuthRequest, res: Response) => {
  try {
    const parent = await Parent.findById(req.user!.id);
    if (!parent) { res.status(404).json({ error: 'Parent not found' }); return; }

    // Ensure the child belongs to this parent
    const childId = req.params.id;
    if (!parent.children.map((c) => c.toString()).includes(childId)) {
      res.status(403).json({ error: 'Child not linked to this parent' });
      return;
    }

    const [child, progress] = await Promise.all([
      User.findById(childId, '-pin_hash'),
      Progress.find({ user_id: childId })
        .sort({ completed_at: -1 })
        .populate('lesson_id', 'title_en title_ar position'),
    ]);

    if (!child) { res.status(404).json({ error: 'Child not found' }); return; }

    const lessonsCompleted = new Set(progress.map((p) => p.lesson_id.toString())).size;
    const avgAccuracy = progress.length
      ? Math.round(progress.reduce((sum, p) => sum + p.accuracy_pct, 0) / progress.length)
      : 0;
    const totalStars = progress.reduce((sum, p) => sum + p.stars, 0);

    res.json({
      child,
      summary: {
        lessons_completed: lessonsCompleted,
        total_attempts: progress.length,
        average_accuracy: avgAccuracy,
        total_stars: totalStars,
      },
      recent_progress: progress.slice(0, 10),
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
