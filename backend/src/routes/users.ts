import { Router, Response } from 'express';
import User from '../models/User';
import ShopItem from '../models/ShopItem';
import { authenticateToken, AuthRequest, requireChild } from '../middleware/auth';

const router = Router();

// GET /api/users/me — get current user profile
router.get('/me', authenticateToken, requireChild, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id, '-pin_hash');
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/users/me/avatar — update avatar selection
router.patch('/me/avatar', authenticateToken, requireChild, async (req: AuthRequest, res: Response) => {
  try {
    const { base_id } = req.body;
    if (!base_id) { res.status(400).json({ error: 'base_id required' }); return; }

    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { 'avatar.base_id': base_id },
      { new: true, select: '-pin_hash' }
    );
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users/me/coins/spend — spend coins on shop item
router.post('/me/coins/spend', authenticateToken, requireChild, async (req: AuthRequest, res: Response) => {
  try {
    const { item_id } = req.body;
    if (!item_id) { res.status(400).json({ error: 'item_id required' }); return; }

    const [user, item] = await Promise.all([
      User.findById(req.user!.id),
      ShopItem.findById(item_id),
    ]);

    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    if (!item) { res.status(404).json({ error: 'Item not found' }); return; }
    if (item.is_premium_only && !user.is_premium) {
      res.status(403).json({ error: 'Premium required for this item' }); return;
    }
    if (user.avatar.unlocked_items.includes(item_id)) {
      res.status(409).json({ error: 'Item already owned' }); return;
    }
    if (user.coins < item.cost) {
      res.status(400).json({ error: 'Not enough coins' }); return;
    }

    user.coins -= item.cost;
    user.avatar.unlocked_items.push(item_id);
    await user.save();

    res.json({ coins_remaining: user.coins, unlocked_item: item_id });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
