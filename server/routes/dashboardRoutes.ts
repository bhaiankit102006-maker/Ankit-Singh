import { Router, Response } from 'express';
import { db } from '../db.ts';
import { requireAuth, AuthRequest } from '../auth.ts';

export const dashboardRouter = Router();

// GET /api/dashboard?date=YYYY-MM-DD
dashboardRouter.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const targetDate = (req.query.date as string) || new Date().toISOString().split('T')[0];

    // 1. User & Profile
    const user = await db.findUserById(userId);
    const profile = await db.getUserProfile(userId);
    const settings = await db.getUserSettings(userId);

    // 2. Today's meals
    const todayEntries = await db.getMealEntries(userId, targetDate);

    const todayTotals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };

    const mealCategories = {
      breakfast: [] as typeof todayEntries,
      morning_snack: [] as typeof todayEntries,
      lunch: [] as typeof todayEntries,
      evening_snack: [] as typeof todayEntries,
      dinner: [] as typeof todayEntries,
    };

    todayEntries.forEach((item) => {
      todayTotals.calories += Number(item.calories);
      todayTotals.protein += Number(item.protein);
      todayTotals.carbs += Number(item.carbs);
      todayTotals.fat += Number(item.fat);
      todayTotals.fiber += Number(item.fiber || 0);
      todayTotals.sugar += Number(item.sugar || 0);
      todayTotals.sodium += Number(item.sodium || 0);

      const type = item.meal_type as keyof typeof mealCategories;
      if (mealCategories[type]) {
        mealCategories[type].push(item);
      } else {
        mealCategories.breakfast.push(item);
      }
    });

    // 3. Today's Water
    const waterEntries = await db.getWaterEntries(userId, targetDate);
    const waterConsumedMl = waterEntries.reduce((sum, item) => sum + item.amount_ml, 0);

    // 4. Targets
    const calorieTarget = profile?.daily_calorie_target || 2000;
    const proteinTarget = profile?.protein_target_g || 120;
    const carbsTarget = profile?.carbs_target_g || 220;
    const fatTarget = profile?.fat_target_g || 65;
    const waterTarget = profile?.water_target_ml || 2500;

    const remainingCalories = calorieTarget - Math.round(todayTotals.calories);
    const remainingProtein = Math.max(0, Math.round((proteinTarget - todayTotals.protein) * 10) / 10);
    const remainingCarbs = Math.max(0, Math.round((carbsTarget - todayTotals.carbs) * 10) / 10);
    const remainingFat = Math.max(0, Math.round((fatTarget - todayTotals.fat) * 10) / 10);
    const remainingWater = Math.max(0, waterTarget - waterConsumedMl);

    // 5. 7-day Calorie History
    const historyDays = 7;
    const calorieHistory = [];
    const targetDateObj = new Date(targetDate);

    for (let i = historyDays - 1; i >= 0; i--) {
      const d = new Date(targetDateObj);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayMeals = await db.getMealEntries(userId, dateStr);
      const dayCals = dayMeals.reduce((sum, m) => sum + Number(m.calories), 0);
      const dayWater = await db.getWaterEntries(userId, dateStr);
      const dayWaterMl = dayWater.reduce((sum, w) => sum + w.amount_ml, 0);

      calorieHistory.push({
        date: dateStr,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        calories: Math.round(dayCals),
        target: calorieTarget,
        water_ml: dayWaterMl,
      });
    }

    // 6. Weight history
    const weightEntries = await db.getWeightEntries(userId, 30);

    res.json({
      success: true,
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
      },
      profile,
      settings,
      date: targetDate,
      totals: {
        calories: Math.round(todayTotals.calories),
        protein: Math.round(todayTotals.protein * 10) / 10,
        carbs: Math.round(todayTotals.carbs * 10) / 10,
        fat: Math.round(todayTotals.fat * 10) / 10,
        fiber: Math.round(todayTotals.fiber * 10) / 10,
        water_ml: waterConsumedMl,
      },
      targets: {
        calories: calorieTarget,
        protein: proteinTarget,
        carbs: carbsTarget,
        fat: fatTarget,
        water_ml: waterTarget,
      },
      remaining: {
        calories: remainingCalories,
        protein: remainingProtein,
        carbs: remainingCarbs,
        fat: remainingFat,
        water_ml: remainingWater,
      },
      percentages: {
        calories: Math.min(150, Math.round((todayTotals.calories / calorieTarget) * 100)),
        protein: Math.min(150, Math.round((todayTotals.protein / proteinTarget) * 100)),
        carbs: Math.min(150, Math.round((todayTotals.carbs / carbsTarget) * 100)),
        fat: Math.min(150, Math.round((todayTotals.fat / fatTarget) * 100)),
        water: Math.min(150, Math.round((waterConsumedMl / waterTarget) * 100)),
      },
      meals: mealCategories,
      recentWeight: weightEntries,
      calorieHistory,
    });
  } catch (err) {
    console.error('[Dashboard GET] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to aggregate dashboard data' });
  }
});
