import { Router, Response } from 'express';
import { db } from '../db.ts';
import { requireAuth, AuthRequest } from '../auth.ts';

export const settingsRouter = Router();

// GET /api/settings
settingsRouter.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const settings = await db.getUserSettings(userId);
    res.json({ success: true, settings });
  } catch (err) {
    console.error('[Settings GET] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve settings' });
  }
});

// PUT /api/settings
settingsRouter.put('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { unit_system, daily_water_target_ml, notifications_enabled, privacy_analytics } = req.body;

    const updated = await db.updateUserSettings(userId, {
      unit_system: unit_system || undefined,
      daily_water_target_ml: daily_water_target_ml !== undefined ? Number(daily_water_target_ml) : undefined,
      notifications_enabled: notifications_enabled !== undefined ? (notifications_enabled ? 1 : 0) : undefined,
      privacy_analytics: privacy_analytics !== undefined ? (privacy_analytics ? 1 : 0) : undefined,
    });

    res.json({ success: true, message: 'Settings saved', settings: updated });
  } catch (err) {
    console.error('[Settings PUT] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

// POST /api/account/delete
settingsRouter.post('/account/delete', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { confirmation } = req.body;

    if (confirmation !== 'DELETE') {
      res.status(400).json({ success: false, message: "Please type 'DELETE' to confirm irreversible account deletion." });
      return;
    }

    await db.deleteUserAccount(userId);
    res.json({ success: true, message: 'Your NutriTrack account and associated personal records have been completely deleted.' });
  } catch (err) {
    console.error('[Account Delete] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
});
