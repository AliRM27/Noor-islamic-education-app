import { Router, Response } from 'express';
import ShopItem from '../models/ShopItem';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/shop/items — list all avatar shop items
router.get('/items', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    const items = await ShopItem.find({}).sort({ cost: 1 });
    res.json({ items });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
