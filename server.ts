import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';
import { authRouter } from './server/routes/authRoutes.ts';
import { profileRouter } from './server/routes/profileRoutes.ts';
import { foodRouter } from './server/routes/foodRoutes.ts';
import { mealRouter } from './server/routes/mealRoutes.ts';
import { waterRouter } from './server/routes/waterRoutes.ts';
import { weightRouter } from './server/routes/weightRoutes.ts';
import { mealPlanRouter } from './server/routes/mealPlanRoutes.ts';
import { dashboardRouter } from './server/routes/dashboardRoutes.ts';
import { aiRouter } from './server/routes/aiRoutes.ts';
import { settingsRouter } from './server/routes/settingsRoutes.ts';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// CORS configuration (allow cross-origin requests cleanly)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Health Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = db.getStatus();
  res.json({
    status: 'ok',
    service: 'NutriTrack API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    gemini_ai_configured: !!process.env.GEMINI_API_KEY,
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/foods', foodRouter);
app.use('/api/meals', mealRouter);
app.use('/api/water', waterRouter);
app.use('/api/weight', weightRouter);
app.use('/api/meal-plans', mealPlanRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/food-scan', aiRouter);
app.use('/api/ai', aiRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/account', settingsRouter);

// Frontend Vite Integration
async function startServer() {
  await db.initialize();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NutriTrack] Server successfully listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[NutriTrack] Failed to start server:', err);
});
