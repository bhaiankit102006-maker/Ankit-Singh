import { Router, Response } from 'express';
import { db } from '../db.ts';
import { requireAuth, AuthRequest } from '../auth.ts';

export const waterRouter = Router();

// GET /api/water?date=YYYY-MM-DD
waterRouter.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const entries = await db.getWaterEntries(userId, date);
    const totalMl = entries.reduce((acc, curr) => acc + curr.amount_ml, 0);

    const profile = await db.getUserProfile(userId);
    const targetMl = profile?.water_target_ml || 2500;

    res.json({
      success: true,
      date,
      entries,
      total_ml: totalMl,
      target_ml: targetMl,
      percentage: Math.min(100, Math.round((totalMl / targetMl) * 100)),
    });
  } catch (err) {
    console.error('[Water GET] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve water intake' });
  }
});

// POST /api/water
waterRouter.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { date, amount_ml } = req.body;

    if (!amount_ml || Number(amount_ml) <= 0) {
      res.status(400).json({ success: false, message: 'Valid water amount (ml) is required' });
      return;
    }

    const logDate = date || new Date().toISOString().split('T')[0];
    const entry = await db.addWaterEntry(userId, logDate, Number(amount_ml));

    // get new total
    const entries = await db.getWaterEntries(userId, logDate);
    const totalMl = entries.reduce((acc, curr) => acc + curr.amount_ml, 0);

    res.status(201).json({
      success: true,
      message: `Added ${amount_ml}ml of water`,
      entry,
      total_ml: totalMl,
    });
  } catch (err) {
    console.error('[Water POST] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to record water intake' });
  }
});

// DELETE /api/water/:id
waterRouter.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = Number(req.params.id);
    const success = await db.deleteWaterEntry(id, userId);
    if (!success) {
      res.status(404).json({ success: false, message: 'Water entry not found' });
      return;
    }
    res.json({ success: true, message: 'Water entry removed' });
  } catch (err) {
    console.error('[Water DELETE] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to remove water entry' });
  }
});
