import { Router, Response } from 'express';
import { db } from '../db.ts';
import { requireAuth, AuthRequest } from '../auth.ts';

export const mealRouter = Router();

// GET /api/meals?date=YYYY-MM-DD
mealRouter.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const entries = await db.getMealEntries(userId, date);

    // Calculate totals
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };

    const mealCategories = {
      breakfast: [] as typeof entries,
      morning_snack: [] as typeof entries,
      lunch: [] as typeof entries,
      evening_snack: [] as typeof entries,
      dinner: [] as typeof entries,
    };

    entries.forEach((item) => {
      totals.calories += Number(item.calories);
      totals.protein += Number(item.protein);
      totals.carbs += Number(item.carbs);
      totals.fat += Number(item.fat);
      totals.fiber += Number(item.fiber || 0);
      totals.sugar += Number(item.sugar || 0);
      totals.sodium += Number(item.sodium || 0);

      const type = item.meal_type as keyof typeof mealCategories;
      if (mealCategories[type]) {
        mealCategories[type].push(item);
      } else {
        mealCategories.breakfast.push(item);
      }
    });

    res.json({
      success: true,
      date,
      entries,
      grouped: mealCategories,
      totals: {
        calories: Math.round(totals.calories * 10) / 10,
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
        fiber: Math.round(totals.fiber * 10) / 10,
        sugar: Math.round(totals.sugar * 10) / 10,
        sodium: Math.round(totals.sodium * 10) / 10,
      },
    });
  } catch (err) {
    console.error('[Meals GET] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve meal diary entries' });
  }
});

// POST /api/meals
mealRouter.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      date,
      meal_type,
      food_id,
      food_name,
      portion_quantity,
      portion_unit,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
    } = req.body;

    if (!food_name || !meal_type) {
      res.status(400).json({ success: false, message: 'Food name and meal type are required' });
      return;
    }

    const logDate = date || new Date().toISOString().split('T')[0];

    const created = await db.createMealEntry(userId, {
      date: logDate,
      meal_type,
      food_id: food_id ? Number(food_id) : null,
      food_name: food_name.trim(),
      portion_quantity: Number(portion_quantity) || 100,
      portion_unit: portion_unit || 'g',
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      fiber: Number(fiber) || 0,
      sugar: Number(sugar) || 0,
      sodium: Number(sodium) || 0,
    });

    res.status(201).json({ success: true, message: 'Meal logged successfully', entry: created });
  } catch (err) {
    console.error('[Meals POST] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to log meal entry' });
  }
});

// PUT /api/meals/:id
mealRouter.put('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = Number(req.params.id);
    const { portion_quantity, calories, protein, carbs, fat, fiber, meal_type } = req.body;

    const updated = await db.updateMealEntry(id, userId, {
      portion_quantity: portion_quantity !== undefined ? Number(portion_quantity) : undefined,
      calories: calories !== undefined ? Number(calories) : undefined,
      protein: protein !== undefined ? Number(protein) : undefined,
      carbs: carbs !== undefined ? Number(carbs) : undefined,
      fat: fat !== undefined ? Number(fat) : undefined,
      fiber: fiber !== undefined ? Number(fiber) : undefined,
      meal_type: meal_type || undefined,
    });

    if (!updated) {
      res.status(404).json({ success: false, message: 'Meal entry not found or unauthorized' });
      return;
    }

    res.json({ success: true, message: 'Meal entry updated', entry: updated });
  } catch (err) {
    console.error('[Meals PUT] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to update meal entry' });
  }
});

// DELETE /api/meals/:id
mealRouter.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = Number(req.params.id);
    const success = await db.deleteMealEntry(id, userId);
    if (!success) {
      res.status(404).json({ success: false, message: 'Entry not found or unauthorized' });
      return;
    }
    res.json({ success: true, message: 'Meal entry deleted' });
  } catch (err) {
    console.error('[Meals DELETE] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete meal entry' });
  }
});

// POST /api/meals/duplicate
mealRouter.post('/duplicate', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { fromDate, toDate, mealType } = req.body;
    if (!fromDate || !toDate) {
      res.status(400).json({ success: false, message: 'fromDate and toDate are required' });
      return;
    }

    const duplicated = await db.duplicateMeal(userId, fromDate, toDate, mealType);
    res.json({
      success: true,
      message: `Successfully copied ${duplicated.length} meal entries to ${toDate}`,
      entries: duplicated,
    });
  } catch (err) {
    console.error('[Meals DUPLICATE] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to duplicate meal' });
  }
});
