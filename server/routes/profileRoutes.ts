import { Router, Response } from 'express';
import { db } from '../db.ts';
import { requireAuth, AuthRequest } from '../auth.ts';

export const profileRouter = Router();

// GET /api/profile
profileRouter.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const profile = await db.getUserProfile(userId);
    const settings = await db.getUserSettings(userId);
    res.json({ success: true, profile, settings });
  } catch (err) {
    console.error('[Profile GET] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// PUT /api/profile
profileRouter.put('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      age,
      date_of_birth,
      gender,
      height_cm,
      current_weight_kg,
      target_weight_kg,
      activity_level,
      goal,
      dietary_preference,
      allergies,
      meals_per_day,
      bmr,
      tdee,
      daily_calorie_target,
      protein_target_g,
      carbs_target_g,
      fat_target_g,
      water_target_ml,
      health_notes,
    } = req.body;

    const updated = await db.upsertUserProfile(userId, {
      age: age ? Number(age) : null,
      date_of_birth: date_of_birth || null,
      gender: gender || 'prefer_not_to_say',
      height_cm: height_cm ? Number(height_cm) : null,
      current_weight_kg: current_weight_kg ? Number(current_weight_kg) : null,
      target_weight_kg: target_weight_kg ? Number(target_weight_kg) : null,
      activity_level: activity_level || 'sedentary',
      goal: goal || 'maintain_weight',
      dietary_preference: dietary_preference || 'omnivore',
      allergies: allergies || null,
      meals_per_day: meals_per_day ? Number(meals_per_day) : 3,
      bmr: bmr ? Number(bmr) : null,
      tdee: tdee ? Number(tdee) : null,
      daily_calorie_target: daily_calorie_target ? Number(daily_calorie_target) : 2000,
      protein_target_g: protein_target_g ? Number(protein_target_g) : 120,
      carbs_target_g: carbs_target_g ? Number(carbs_target_g) : 220,
      fat_target_g: fat_target_g ? Number(fat_target_g) : 65,
      water_target_ml: water_target_ml ? Number(water_target_ml) : 2500,
      health_notes: health_notes || null,
    });

    res.json({ success: true, message: 'Profile updated successfully', profile: updated });
  } catch (err) {
    console.error('[Profile PUT] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// GET /api/profile/goals
profileRouter.get('/goals', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const profile = await db.getUserProfile(userId);
    res.json({
      success: true,
      goals: {
        daily_calorie_target: profile?.daily_calorie_target || 2000,
        protein_target_g: profile?.protein_target_g || 120,
        carbs_target_g: profile?.carbs_target_g || 220,
        fat_target_g: profile?.fat_target_g || 65,
        water_target_ml: profile?.water_target_ml || 2500,
        goal: profile?.goal || 'maintain_weight',
        current_weight_kg: profile?.current_weight_kg || null,
        target_weight_kg: profile?.target_weight_kg || null,
      },
    });
  } catch (err) {
    console.error('[Goals GET] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch goals' });
  }
});

// PUT /api/profile/goals
profileRouter.put('/goals', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { daily_calorie_target, protein_target_g, carbs_target_g, fat_target_g, water_target_ml, target_weight_kg, goal } = req.body;

    const updated = await db.upsertUserProfile(userId, {
      daily_calorie_target: daily_calorie_target ? Number(daily_calorie_target) : undefined,
      protein_target_g: protein_target_g ? Number(protein_target_g) : undefined,
      carbs_target_g: carbs_target_g ? Number(carbs_target_g) : undefined,
      fat_target_g: fat_target_g ? Number(fat_target_g) : undefined,
      water_target_ml: water_target_ml ? Number(water_target_ml) : undefined,
      target_weight_kg: target_weight_kg ? Number(target_weight_kg) : undefined,
      goal: goal || undefined,
    });

    res.json({ success: true, message: 'Goals updated successfully', profile: updated });
  } catch (err) {
    console.error('[Goals PUT] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to update goals' });
  }
});
