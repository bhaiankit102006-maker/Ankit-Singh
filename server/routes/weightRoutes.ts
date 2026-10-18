import { Router, Response } from 'express';
import { db } from '../db.ts';
import { requireAuth, AuthRequest } from '../auth.ts';

export const weightRouter = Router();

// GET /api/weight
weightRouter.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const entries = await db.getWeightEntries(userId, 90);
    const profile = await db.getUserProfile(userId);

    // Compute progress stats
    const currentWeight = entries.length > 0 ? entries[entries.length - 1].weight_kg : (profile?.current_weight_kg || null);
    const startWeight = entries.length > 0 ? entries[0].weight_kg : currentWeight;
    const targetWeight = profile?.target_weight_kg || null;

    let totalChange = null;
    let remainingToTarget = null;
    if (currentWeight !== null && startWeight !== null) {
      totalChange = Math.round((currentWeight - startWeight) * 10) / 10;
    }
    if (currentWeight !== null && targetWeight !== null) {
      remainingToTarget = Math.round(Math.abs(currentWeight - targetWeight) * 10) / 10;
    }

    res.json({
      success: true,
      entries,
      stats: {
        current_weight: currentWeight,
        start_weight: startWeight,
        target_weight: targetWeight,
        total_change: totalChange,
        remaining_to_target: remainingToTarget,
        goal: profile?.goal || 'maintain_weight',
      },
    });
  } catch (err) {
    console.error('[Weight GET] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve weight entries' });
  }
});

// POST /api/weight
weightRouter.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { date, weight_kg, notes } = req.body;

    if (!weight_kg || Number(weight_kg) <= 0) {
      res.status(400).json({ success: false, message: 'A valid weight in kg is required' });
      return;
    }

    const logDate = date || new Date().toISOString().split('T')[0];
    const entry = await db.addWeightEntry(userId, logDate, Number(weight_kg), notes);

    res.status(201).json({ success: true, message: 'Weight recorded successfully', entry });
  } catch (err) {
    console.error('[Weight POST] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to record weight entry' });
  }
});

// DELETE /api/weight/:id
weightRouter.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = Number(req.params.id);
    const success = await db.deleteWeightEntry(id, userId);
    if (!success) {
      res.status(404).json({ success: false, message: 'Weight entry not found' });
      return;
    }
    res.json({ success: true, message: 'Weight entry removed' });
  } catch (err) {
    console.error('[Weight DELETE] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to remove weight entry' });
  }
});
