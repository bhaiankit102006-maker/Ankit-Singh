import { Router, Request, Response } from 'express';
import { db } from '../db.ts';
import { hashPassword, comparePassword, signToken, requireAuth, AuthRequest } from '../auth.ts';

export const authRouter = Router();

// POST /api/auth/signup
authRouter.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Full name is required.' });
      return;
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }
    if (!password || password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    const existing = await db.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email address already exists. Please log in.' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user = await db.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'user',
    });

    // Create default profile with baseline recommendations
    const defaultProfile = await db.upsertUserProfile(user.id, {
      age: 28,
      gender: 'prefer_not_to_say',
      height_cm: 172,
      current_weight_kg: 70,
      target_weight_kg: 68,
      activity_level: 'moderate',
      goal: 'maintain_weight',
      dietary_preference: 'omnivore',
      daily_calorie_target: 2100,
      protein_target_g: 130,
      carbs_target_g: 235,
      fat_target_g: 65,
      water_target_ml: 2500,
      meals_per_day: 3,
    });

    const token = signToken(user);
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
      },
      profile: defaultProfile,
    });
  } catch (err) {
    console.error('[Signup] Error:', err);
    res.status(500).json({ success: false, message: 'Internal error creating account.' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const profile = await db.getUserProfile(user.id);
    const token = signToken(user);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
      },
      profile,
    });
  } catch (err) {
    console.error('[Login] Error:', err);
    res.status(500).json({ success: false, message: 'Internal error during login.' });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = await db.findUserById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    const profile = await db.getUserProfile(userId);
    const settings = await db.getUserSettings(userId);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
      },
      profile,
      settings,
    });
  } catch (err) {
    console.error('[Auth Me] Error:', err);
    res.status(500).json({ success: false, message: 'Error retrieving profile.' });
  }
});
