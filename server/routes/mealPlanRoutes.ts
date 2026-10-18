import { Router, Response } from 'express';
import { db } from '../db.ts';
import { requireAuth, AuthRequest } from '../auth.ts';

export const mealPlanRouter = Router();

// GET /api/meal-plans
mealPlanRouter.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const plans = await db.getMealPlans(userId);
    res.json({ success: true, plans });
  } catch (err) {
    console.error('[MealPlans GET] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve meal plans' });
  }
});

// POST /api/meal-plans
mealPlanRouter.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { title, day_of_week, notes, items } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: 'Meal plan title is required' });
      return;
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'At least one food item is required in the plan' });
      return;
    }

    const created = await db.createMealPlan(userId, {
      title: title.trim(),
      day_of_week: day_of_week || 'any',
      notes: notes || null,
      items,
    });

    res.status(201).json({ success: true, message: 'Meal plan saved successfully', plan: created });
  } catch (err) {
    console.error('[MealPlans POST] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to create meal plan' });
  }
});

// DELETE /api/meal-plans/:id
mealPlanRouter.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = Number(req.params.id);
    const success = await db.deleteMealPlan(id, userId);
    if (!success) {
      res.status(404).json({ success: false, message: 'Meal plan not found' });
      return;
    }
    res.json({ success: true, message: 'Meal plan deleted' });
  } catch (err) {
    console.error('[MealPlans DELETE] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete meal plan' });
  }
});

// POST /api/meal-plans/:id/apply (copies plan items to food diary for a specified date)
mealPlanRouter.post('/:id/apply', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = Number(req.params.id);
    const targetDate = req.body.date || new Date().toISOString().split('T')[0];

    const plans = await db.getMealPlans(userId);
    const plan = plans.find((p) => p.id === id);

    if (!plan || !plan.items || plan.items.length === 0) {
      res.status(404).json({ success: false, message: 'Meal plan not found or has no items' });
      return;
    }

    const loggedEntries = [];
    for (const item of plan.items) {
      const entry = await db.createMealEntry(userId, {
        date: targetDate,
        meal_type: item.meal_type,
        food_id: item.food_id,
        food_name: item.food_name,
        portion_quantity: item.portion_quantity,
        portion_unit: item.portion_unit,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
      });
      loggedEntries.push(entry);
    }

    res.json({
      success: true,
      message: `Applied ${loggedEntries.length} items from '${plan.title}' to your diary for ${targetDate}`,
      entries: loggedEntries,
    });
  } catch (err) {
    console.error('[MealPlans APPLY] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to apply meal plan to diary' });
  }
});
