import { Router, Request, Response } from 'express';
import { db } from '../db.ts';
import { requireAuth, AuthRequest } from '../auth.ts';

export const foodRouter = Router();

// GET /api/foods?search=&category=&limit=&offset=
foodRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const limit = parseInt(req.query.limit as string || '60', 10);
    const offset = parseInt(req.query.offset as string || '0', 10);

    const result = await db.searchFoods({ query: search, category, limit, offset });
    res.json({
      success: true,
      foods: result.foods,
      total: result.total,
      limit,
      offset,
    });
  } catch (err) {
    console.error('[Foods Search] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to search food database' });
  }
});

// GET /api/foods/favorites
foodRouter.get('/favorites', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const favorites = await db.getFavoriteFoods(userId);
    res.json({ success: true, favorites });
  } catch (err) {
    console.error('[Favorites GET] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch favorite foods' });
  }
});

// POST /api/foods/favorites
foodRouter.post('/favorites', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { foodId } = req.body;
    if (!foodId) {
      res.status(400).json({ success: false, message: 'foodId is required' });
      return;
    }
    await db.addFavoriteFood(userId, Number(foodId));
    res.json({ success: true, message: 'Added to favorites' });
  } catch (err) {
    console.error('[Favorites POST] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to add favorite food' });
  }
});

// DELETE /api/foods/favorites/:foodId
foodRouter.delete('/favorites/:foodId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const foodId = Number(req.params.foodId);
    await db.removeFavoriteFood(userId, foodId);
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (err) {
    console.error('[Favorites DELETE] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to remove favorite food' });
  }
});

// GET /api/foods/:id
foodRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const food = await db.getFoodById(id);
    if (!food) {
      res.status(404).json({ success: false, message: 'Food item not found' });
      return;
    }
    res.json({ success: true, food });
  } catch (err) {
    console.error('[Food GET] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve food' });
  }
});

// POST /api/foods/custom
foodRouter.post('/custom', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      name,
      brand,
      category,
      serving_size,
      serving_unit,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      source,
    } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Food name is required' });
      return;
    }
    if (calories === undefined || calories === null) {
      res.status(400).json({ success: false, message: 'Calories are required' });
      return;
    }

    const created = await db.createCustomFood(userId, {
      name: name.trim(),
      brand: brand ? brand.trim() : null,
      category: category || 'Custom',
      serving_size: Number(serving_size) || 100,
      serving_unit: serving_unit || 'g',
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      fiber: Number(fiber) || 0,
      sugar: Number(sugar) || 0,
      sodium: Number(sodium) || 0,
      source: source || 'Custom User Food',
    });

    res.status(201).json({ success: true, message: 'Custom food saved successfully', food: created });
  } catch (err) {
    console.error('[Custom Food POST] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to create custom food item' });
  }
});
