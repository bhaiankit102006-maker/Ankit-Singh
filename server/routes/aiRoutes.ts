import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../auth.ts';
import { analyzeFoodImage, getNutritionAdvisorAdvice } from '../gemini.ts';
import { db } from '../db.ts';

export const aiRouter = Router();

// POST /api/food-scan/analyze
aiRouter.post('/analyze', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { image, mimeType } = req.body;

    if (!image) {
      res.status(400).json({ success: false, message: 'Image data (base64 string) is required for food scanning.' });
      return;
    }

    const result = await analyzeFoodImage(image, mimeType || 'image/jpeg');

    res.json({
      success: true,
      analysis: result,
    });
  } catch (err: any) {
    console.error('[AI Food Scan] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to analyze food image.', error: err.message });
  }
});

// POST /api/ai/nutrition-advisor
aiRouter.post('/advisor', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { query, todayTotals } = req.body;

    if (!query || !query.trim()) {
      res.status(400).json({ success: false, message: 'Question or dietary inquiry is required.' });
      return;
    }

    const profile = await db.getUserProfile(userId);

    const adviceResult = await getNutritionAdvisorAdvice({
      userProfile: profile,
      todayTotals: todayTotals || { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 },
      query: query.trim(),
    });

    res.json({
      success: true,
      result: adviceResult,
    });
  } catch (err: any) {
    console.error('[AI Advisor] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate nutrition advice.' });
  }
});
