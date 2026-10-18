import fs from 'fs';
import path from 'path';
import mysql, { Pool } from 'mysql2/promise';
import { SEED_FOODS, FoodSeed } from './seedFoods.ts';

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  is_verified: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfileRecord {
  id: number;
  user_id: number;
  age: number | null;
  date_of_birth: string | null;
  gender: string;
  height_cm: number | null;
  current_weight_kg: number | null;
  target_weight_kg: number | null;
  activity_level: string;
  goal: string;
  dietary_preference: string;
  allergies: string | null;
  meals_per_day: number;
  bmr: number | null;
  tdee: number | null;
  daily_calorie_target: number;
  protein_target_g: number;
  carbs_target_g: number;
  fat_target_g: number;
  water_target_ml: number;
  health_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FoodItemRecord {
  id: number;
  name: string;
  brand: string | null;
  category: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  source: string;
  is_custom: number;
  created_by_user_id: number | null;
  created_at: string;
}

export interface MealEntryRecord {
  id: number;
  user_id: number;
  date: string;
  meal_type: string;
  food_id: number | null;
  food_name: string;
  portion_quantity: number;
  portion_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  created_at: string;
  updated_at: string;
}

export interface WaterEntryRecord {
  id: number;
  user_id: number;
  date: string;
  amount_ml: number;
  created_at: string;
}

export interface WeightEntryRecord {
  id: number;
  user_id: number;
  date: string;
  weight_kg: number;
  notes: string | null;
  created_at: string;
}

export interface MealPlanItemRecord {
  id: number;
  meal_plan_id: number;
  meal_type: string;
  food_id: number | null;
  food_name: string;
  portion_quantity: number;
  portion_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealPlanRecord {
  id: number;
  user_id: number;
  title: string;
  day_of_week: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: MealPlanItemRecord[];
}

export interface UserSettingsRecord {
  id: number;
  user_id: number;
  unit_system: string;
  daily_water_target_ml: number;
  notifications_enabled: number;
  privacy_analytics: number;
  created_at: string;
  updated_at: string;
}

interface LocalDatabaseState {
  users: UserRecord[];
  user_profiles: UserProfileRecord[];
  food_items: FoodItemRecord[];
  food_favorites: { id: number; user_id: number; food_id: number; created_at: string }[];
  meal_entries: MealEntryRecord[];
  water_entries: WaterEntryRecord[];
  weight_entries: WeightEntryRecord[];
  meal_plans: MealPlanRecord[];
  meal_plan_items: MealPlanItemRecord[];
  user_settings: UserSettingsRecord[];
  nextId: { [table: string]: number };
}

class NutriTrackDatabase {
  private mode: 'mysql' | 'local' = 'local';
  private pool: Pool | null = null;
  private localDataDir = path.resolve('.data');
  private localDataFile = path.resolve('.data/nutritrack.json');
  private localState: LocalDatabaseState = {
    users: [],
    user_profiles: [],
    food_items: [],
    food_favorites: [],
    meal_entries: [],
    water_entries: [],
    weight_entries: [],
    meal_plans: [],
    meal_plan_items: [],
    user_settings: [],
    nextId: {
      users: 1,
      user_profiles: 1,
      food_items: 1,
      food_favorites: 1,
      meal_entries: 1,
      water_entries: 1,
      weight_entries: 1,
      meal_plans: 1,
      meal_plan_items: 1,
      user_settings: 1,
    },
  };
  private isInitialized = false;

  constructor() {
    this.ensureLocalDir();
  }

  private ensureLocalDir() {
    if (!fs.existsSync(this.localDataDir)) {
      try {
        fs.mkdirSync(this.localDataDir, { recursive: true });
      } catch (e) {
        // ignore
      }
    }
  }

  private loadLocalData() {
    try {
      if (fs.existsSync(this.localDataFile)) {
        const raw = fs.readFileSync(this.localDataFile, 'utf-8');
        this.localState = JSON.parse(raw);
      } else {
        this.seedLocalFoods();
        this.saveLocalData();
      }
    } catch (err) {
      console.warn('[NutriTrack DB] Error reading local data file, resetting to clean seed:', err);
      this.seedLocalFoods();
      this.saveLocalData();
    }
  }

  private saveLocalData() {
    try {
      this.ensureLocalDir();
      fs.writeFileSync(this.localDataFile, JSON.stringify(this.localState, null, 2), 'utf-8');
    } catch (err) {
      console.error('[NutriTrack DB] Failed to save local database state:', err);
    }
  }

  private seedLocalFoods() {
    if (this.localState.food_items.length === 0) {
      const now = new Date().toISOString();
      SEED_FOODS.forEach((item: FoodSeed) => {
        this.localState.food_items.push({
          id: this.localState.nextId.food_items++,
          name: item.name,
          brand: item.brand || null,
          category: item.category,
          serving_size: item.serving_size,
          serving_unit: item.serving_unit,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          fiber: item.fiber,
          sugar: item.sugar,
          sodium: item.sodium,
          source: item.source,
          is_custom: 0,
          created_by_user_id: null,
          created_at: now,
        });
      });
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Check if MySQL connection is explicitly configured and available
    const host = process.env.DB_HOST;
    const port = parseInt(process.env.DB_PORT || '3307', 10);
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'diet_app';

    if (host) {
      try {
        console.log(`[NutriTrack DB] Attempting MySQL connection to ${host}:${port}/${database}...`);
        const tempPool = mysql.createPool({
          host,
          port,
          user,
          password,
          database,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          connectTimeout: 2000,
        });

        // Test connection
        const conn = await tempPool.getConnection();
        conn.release();
        this.pool = tempPool;
        this.mode = 'mysql';
        console.log(`[NutriTrack DB] Connected successfully to MySQL (${host}:${port}/${database})`);
        await this.runMysqlMigrations();
      } catch (err: any) {
        console.warn(`[NutriTrack DB] MySQL unavailable (${err.message}). Using persistent local relational engine.`);
        this.mode = 'local';
        this.loadLocalData();
      }
    } else {
      console.log('[NutriTrack DB] No DB_HOST set. Using persistent local relational engine at .data/nutritrack.json');
      this.mode = 'local';
      this.loadLocalData();
    }

    this.isInitialized = true;
  }

  private async runMysqlMigrations() {
    if (!this.pool) return;
    try {
      const schemaPath = path.resolve('server/schema.sql');
      if (fs.existsSync(schemaPath)) {
        const sql = fs.readFileSync(schemaPath, 'utf-8');
        // split by ';' and execute
        const statements = sql
          .split(';')
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().startsWith('create database') && !s.toLowerCase().startsWith('use '));

        for (const stmt of statements) {
          try {
            await this.pool.query(stmt);
          } catch (e: any) {
            // table may already exist, ignore minor errors
          }
        }
      }

      // Check if food_items are populated
      const [rows]: any = await this.pool.query('SELECT COUNT(*) as count FROM food_items');
      if (rows[0].count === 0) {
        console.log('[NutriTrack DB] Seeding verified foods into MySQL...');
        for (const item of SEED_FOODS) {
          await this.pool.query(
            `INSERT INTO food_items (name, brand, category, serving_size, serving_unit, calories, protein, carbs, fat, fiber, sugar, sodium, source, is_custom)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            [
              item.name,
              item.brand || null,
              item.category,
              item.serving_size,
              item.serving_unit,
              item.calories,
              item.protein,
              item.carbs,
              item.fat,
              item.fiber,
              item.sugar,
              item.sodium,
              item.source,
            ]
          );
        }
      }
    } catch (err) {
      console.error('[NutriTrack DB] Migration error:', err);
    }
  }

  public getStatus() {
    return {
      mode: this.mode,
      initialized: this.isInitialized,
      userCount: this.mode === 'mysql' ? 'MySQL pool active' : this.localState.users.length,
      foodCount: this.mode === 'mysql' ? 'MySQL table active' : this.localState.food_items.length,
    };
  }

  // --- Users ---
  public async findUserByEmail(email: string): Promise<UserRecord | null> {
    await this.initialize();
    const cleanEmail = email.trim().toLowerCase();
    if (this.mode === 'mysql' && this.pool) {
      const [rows]: any = await this.pool.query('SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1', [cleanEmail]);
      return rows[0] || null;
    }
    const user = this.localState.users.find((u) => u.email.toLowerCase() === cleanEmail);
    return user ? { ...user } : null;
  }

  public async findUserById(id: number): Promise<UserRecord | null> {
    await this.initialize();
    if (this.mode === 'mysql' && this.pool) {
      const [rows]: any = await this.pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
      return rows[0] || null;
    }
    const user = this.localState.users.find((u) => u.id === Number(id));
    return user ? { ...user } : null;
  }

  public async createUser(data: { name: string; email: string; password: string; role?: string }): Promise<UserRecord> {
    await this.initialize();
    const now = new Date().toISOString();
    const cleanEmail = data.email.trim().toLowerCase();
    const role = data.role || 'user';

    if (this.mode === 'mysql' && this.pool) {
      const [result]: any = await this.pool.query(
        'INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, ?, 1)',
        [data.name.trim(), cleanEmail, data.password, role]
      );
      const insertedId = result.insertId;
      // initialize settings
      await this.pool.query('INSERT IGNORE INTO user_settings (user_id) VALUES (?)', [insertedId]);
      return {
        id: insertedId,
        name: data.name.trim(),
        email: cleanEmail,
        password: data.password,
        role,
        is_verified: 1,
        created_at: now,
        updated_at: now,
      };
    }

    const newUser: UserRecord = {
      id: this.localState.nextId.users++,
      name: data.name.trim(),
      email: cleanEmail,
      password: data.password,
      role,
      is_verified: 1,
      created_at: now,
      updated_at: now,
    };
    this.localState.users.push(newUser);

    // Default settings
    this.localState.user_settings.push({
      id: this.localState.nextId.user_settings++,
      user_id: newUser.id,
      unit_system: 'metric',
      daily_water_target_ml: 2500,
      notifications_enabled: 1,
      privacy_analytics: 1,
      created_at: now,
      updated_at: now,
    });

    this.saveLocalData();
    return { ...newUser };
  }

  // --- Profiles & Biometrics ---
  public async getUserProfile(userId: number): Promise<UserProfileRecord | null> {
    await this.initialize();
    if (this.mode === 'mysql' && this.pool) {
      const [rows]: any = await this.pool.query('SELECT * FROM user_profiles WHERE user_id = ? LIMIT 1', [userId]);
      return rows[0] || null;
    }
    const profile = this.localState.user_profiles.find((p) => p.user_id === Number(userId));
    return profile ? { ...profile } : null;
  }

  public async upsertUserProfile(userId: number, data: Partial<UserProfileRecord>): Promise<UserProfileRecord> {
    await this.initialize();
    const now = new Date().toISOString();

    if (this.mode === 'mysql' && this.pool) {
      const existing = await this.getUserProfile(userId);
      if (existing) {
        await this.pool.query(
          `UPDATE user_profiles SET
            age = COALESCE(?, age),
            date_of_birth = COALESCE(?, date_of_birth),
            gender = COALESCE(?, gender),
            height_cm = COALESCE(?, height_cm),
            current_weight_kg = COALESCE(?, current_weight_kg),
            target_weight_kg = COALESCE(?, target_weight_kg),
            activity_level = COALESCE(?, activity_level),
            goal = COALESCE(?, goal),
            dietary_preference = COALESCE(?, dietary_preference),
            allergies = COALESCE(?, allergies),
            meals_per_day = COALESCE(?, meals_per_day),
            bmr = COALESCE(?, bmr),
            tdee = COALESCE(?, tdee),
            daily_calorie_target = COALESCE(?, daily_calorie_target),
            protein_target_g = COALESCE(?, protein_target_g),
            carbs_target_g = COALESCE(?, carbs_target_g),
            fat_target_g = COALESCE(?, fat_target_g),
            water_target_ml = COALESCE(?, water_target_ml),
            health_notes = COALESCE(?, health_notes)
          WHERE user_id = ?`,
          [
            data.age ?? null,
            data.date_of_birth ?? null,
            data.gender ?? null,
            data.height_cm ?? null,
            data.current_weight_kg ?? null,
            data.target_weight_kg ?? null,
            data.activity_level ?? null,
            data.goal ?? null,
            data.dietary_preference ?? null,
            data.allergies ?? null,
            data.meals_per_day ?? null,
            data.bmr ?? null,
            data.tdee ?? null,
            data.daily_calorie_target ?? null,
            data.protein_target_g ?? null,
            data.carbs_target_g ?? null,
            data.fat_target_g ?? null,
            data.water_target_ml ?? null,
            data.health_notes ?? null,
            userId,
          ]
        );
      } else {
        await this.pool.query(
          `INSERT INTO user_profiles (
            user_id, age, date_of_birth, gender, height_cm, current_weight_kg,
            target_weight_kg, activity_level, goal, dietary_preference, allergies,
            meals_per_day, bmr, tdee, daily_calorie_target, protein_target_g,
            carbs_target_g, fat_target_g, water_target_ml, health_notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            data.age ?? null,
            data.date_of_birth ?? null,
            data.gender ?? 'prefer_not_to_say',
            data.height_cm ?? 170,
            data.current_weight_kg ?? 70,
            data.target_weight_kg ?? null,
            data.activity_level ?? 'sedentary',
            data.goal ?? 'maintain_weight',
            data.dietary_preference ?? 'omnivore',
            data.allergies ?? null,
            data.meals_per_day ?? 3,
            data.bmr ?? 1600,
            data.tdee ?? 2000,
            data.daily_calorie_target ?? 2000,
            data.protein_target_g ?? 120,
            data.carbs_target_g ?? 220,
            data.fat_target_g ?? 65,
            data.water_target_ml ?? 2500,
            data.health_notes ?? null,
          ]
        );
      }
      const updated = await this.getUserProfile(userId);
      return updated!;
    }

    let profile = this.localState.user_profiles.find((p) => p.user_id === Number(userId));
    if (profile) {
      Object.assign(profile, data, { updated_at: now });
    } else {
      profile = {
        id: this.localState.nextId.user_profiles++,
        user_id: Number(userId),
        age: data.age ?? null,
        date_of_birth: data.date_of_birth ?? null,
        gender: data.gender ?? 'prefer_not_to_say',
        height_cm: data.height_cm ?? 170,
        current_weight_kg: data.current_weight_kg ?? 70,
        target_weight_kg: data.target_weight_kg ?? null,
        activity_level: data.activity_level ?? 'sedentary',
        goal: data.goal ?? 'maintain_weight',
        dietary_preference: data.dietary_preference ?? 'omnivore',
        allergies: data.allergies ?? null,
        meals_per_day: data.meals_per_day ?? 3,
        bmr: data.bmr ?? 1600,
        tdee: data.tdee ?? 2000,
        daily_calorie_target: data.daily_calorie_target ?? 2000,
        protein_target_g: data.protein_target_g ?? 120,
        carbs_target_g: data.carbs_target_g ?? 220,
        fat_target_g: data.fat_target_g ?? 65,
        water_target_ml: data.water_target_ml ?? 2500,
        health_notes: data.health_notes ?? null,
        created_at: now,
        updated_at: now,
      };
      this.localState.user_profiles.push(profile);
    }
    this.saveLocalData();
    return { ...profile };
  }

  // --- Foods ---
  public async searchFoods(params: {
    query?: string;
    category?: string;
    limit?: number;
    offset?: number;
    userId?: number;
  }): Promise<{ foods: FoodItemRecord[]; total: number }> {
    await this.initialize();
    const q = (params.query || '').trim().toLowerCase();
    const cat = params.category;
    const limit = params.limit || 50;
    const offset = params.offset || 0;

    if (this.mode === 'mysql' && this.pool) {
      let sql = 'SELECT * FROM food_items WHERE 1=1';
      const args: any[] = [];
      if (q) {
        sql += ' AND (LOWER(name) LIKE ? OR LOWER(COALESCE(brand, "")) LIKE ?)';
        args.push(`%${q}%`, `%${q}%`);
      }
      if (cat && cat !== 'All') {
        sql += ' AND category = ?';
        args.push(cat);
      }
      sql += ' ORDER BY is_custom DESC, name ASC LIMIT ? OFFSET ?';
      args.push(limit, offset);

      const [rows]: any = await this.pool.query(sql, args);

      let countSql = 'SELECT COUNT(*) as total FROM food_items WHERE 1=1';
      const countArgs: any[] = [];
      if (q) {
        countSql += ' AND (LOWER(name) LIKE ? OR LOWER(COALESCE(brand, "")) LIKE ?)';
        countArgs.push(`%${q}%`, `%${q}%`);
      }
      if (cat && cat !== 'All') {
        countSql += ' AND category = ?';
        countArgs.push(cat);
      }
      const [countRows]: any = await this.pool.query(countSql, countArgs);

      return { foods: rows, total: countRows[0].total };
    }

    let filtered = this.localState.food_items.filter((item) => {
      const matchesQ =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.brand && item.brand.toLowerCase().includes(q));
      const matchesCat = !cat || cat === 'All' || item.category === cat;
      return matchesQ && matchesCat;
    });

    const total = filtered.length;
    const foods = filtered.slice(offset, offset + limit).map((f) => ({ ...f }));
    return { foods, total };
  }

  public async getFoodById(id: number): Promise<FoodItemRecord | null> {
    await this.initialize();
    if (this.mode === 'mysql' && this.pool) {
      const [rows]: any = await this.pool.query('SELECT * FROM food_items WHERE id = ? LIMIT 1', [id]);
      return rows[0] || null;
    }
    const food = this.localState.food_items.find((f) => f.id === Number(id));
    return food ? { ...food } : null;
  }

  public async createCustomFood(userId: number, data: Omit<FoodItemRecord, 'id' | 'created_at' | 'created_by_user_id' | 'is_custom'>): Promise<FoodItemRecord> {
    await this.initialize();
    const now = new Date().toISOString();

    if (this.mode === 'mysql' && this.pool) {
      const [result]: any = await this.pool.query(
        `INSERT INTO food_items (
          name, brand, category, serving_size, serving_unit,
          calories, protein, carbs, fat, fiber, sugar, sodium,
          source, is_custom, created_by_user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [
          data.name.trim(),
          data.brand || null,
          data.category || 'Custom',
          data.serving_size,
          data.serving_unit || 'g',
          data.calories,
          data.protein,
          data.carbs,
          data.fat,
          data.fiber || 0,
          data.sugar || 0,
          data.sodium || 0,
          data.source || 'User Custom Food',
          userId,
        ]
      );
      const inserted = await this.getFoodById(result.insertId);
      return inserted!;
    }

    const newFood: FoodItemRecord = {
      id: this.localState.nextId.food_items++,
      name: data.name.trim(),
      brand: data.brand || null,
      category: data.category || 'Custom',
      serving_size: data.serving_size,
      serving_unit: data.serving_unit || 'g',
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      fiber: data.fiber || 0,
      sugar: data.sugar || 0,
      sodium: data.sodium || 0,
      source: data.source || 'User Custom Food',
      is_custom: 1,
      created_by_user_id: Number(userId),
      created_at: now,
    };
    this.localState.food_items.push(newFood);
    this.saveLocalData();
    return { ...newFood };
  }

  // --- Favorites ---
  public async getFavoriteFoods(userId: number): Promise<FoodItemRecord[]> {
    await this.initialize();
    if (this.mode === 'mysql' && this.pool) {
      const [rows]: any = await this.pool.query(
        `SELECT f.* FROM food_items f
         INNER JOIN food_favorites fav ON f.id = fav.food_id
         WHERE fav.user_id = ?
         ORDER BY fav.created_at DESC`,
        [userId]
      );
      return rows;
    }
    const favIds = this.localState.food_favorites
      .filter((fav) => fav.user_id === Number(userId))
      .map((fav) => fav.food_id);
    return this.localState.food_items.filter((item) => favIds.includes(item.id)).map((f) => ({ ...f }));
  }

  public async addFavoriteFood(userId: number, foodId: number): Promise<boolean> {
    await this.initialize();
    const now = new Date().toISOString();
    if (this.mode === 'mysql' && this.pool) {
      await this.pool.query('INSERT IGNORE INTO food_favorites (user_id, food_id) VALUES (?, ?)', [userId, foodId]);
      return true;
    }
    const exists = this.localState.food_favorites.some(
      (f) => f.user_id === Number(userId) && f.food_id === Number(foodId)
    );
    if (!exists) {
      this.localState.food_favorites.push({
        id: this.localState.nextId.food_favorites++,
        user_id: Number(userId),
        food_id: Number(foodId),
        created_at: now,
      });
      this.saveLocalData();
    }
    return true;
  }

  public async removeFavoriteFood(userId: number, foodId: number): Promise<boolean> {
    await this.initialize();
    if (this.mode === 'mysql' && this.pool) {
      await this.pool.query('DELETE FROM food_favorites WHERE user_id = ? AND food_id = ?', [userId, foodId]);
      return true;
    }
    this.localState.food_favorites = this.localState.food_favorites.filter(
      (f) => !(f.user_id === Number(userId) && f.food_id === Number(foodId))
    );
    this.saveLocalData();
    return true;
  }

  // --- Meal Diary Entries ---
  public async getMealEntries(userId: number, date: string): Promise<MealEntryRecord[]> {
    await this.initialize();
    if (this.mode === 'mysql' && this.pool) {
      const [rows]: any = await this.pool.query(
        'SELECT * FROM meal_entries WHERE user_id = ? AND date = ? ORDER BY created_at ASC',
        [userId, date]
      );
      return rows;
    }
    return this.localState.meal_entries
      .filter((entry) => entry.user_id === Number(userId) && entry.date === date)
      .map((e) => ({ ...e }));
  }

  public async createMealEntry(userId: number, data: {
    date: string;
    meal_type: string;
    food_id?: number | null;
    food_name: string;
    portion_quantity: number;
    portion_unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  }): Promise<MealEntryRecord> {
    await this.initialize();
    const now = new Date().toISOString();

    if (this.mode === 'mysql' && this.pool) {
      const [res]: any = await this.pool.query(
        `INSERT INTO meal_entries (
          user_id, date, meal_type, food_id, food_name,
          portion_quantity, portion_unit, calories, protein,
          carbs, fat, fiber, sugar, sodium
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          data.date,
          data.meal_type,
          data.food_id || null,
          data.food_name,
          data.portion_quantity,
          data.portion_unit,
          data.calories,
          data.protein,
          data.carbs,
          data.fat,
          data.fiber || 0,
          data.sugar || 0,
          data.sodium || 0,
        ]
      );
      const [rows]: any = await this.pool.query('SELECT * FROM meal_entries WHERE id = ?', [res.insertId]);
      return rows[0];
    }

    const newEntry: MealEntryRecord = {
      id: this.localState.nextId.meal_entries++,
      user_id: Number(userId),
      date: data.date,
      meal_type: data.meal_type,
      food_id: data.food_id ? Number(data.food_id) : null,
      food_name: data.food_name,
      portion_quantity: Number(data.portion_quantity),
      portion_unit: data.portion_unit,
      calories: Number(data.calories),
      protein: Number(data.protein),
      carbs: Number(data.carbs),
      fat: Number(data.fat),
      fiber: Number(data.fiber || 0),
      sugar: Number(data.sugar || 0),
      sodium: Number(data.sodium || 0),
      created_at: now,
      updated_at: now,
    };
    this.localState.meal_entries.push(newEntry);
    this.saveLocalData();
    return { ...newEntry };
  }

  public async updateMealEntry(id: number, userId: number, data: Partial<MealEntryRecord>): Promise<MealEntryRecord | null> {
    await this.initialize();
    const now = new Date().toISOString();

    if (this.mode === 'mysql' && this.pool) {
      await this.pool.query(
        `UPDATE meal_entries SET
          portion_quantity = COALESCE(?, portion_quantity),
          calories = COALESCE(?, calories),
          protein = COALESCE(?, protein),
          carbs = COALESCE(?, carbs),
          fat = COALESCE(?, fat),
          fiber = COALESCE(?, fiber),
          meal_type = COALESCE(?, meal_type)
        WHERE id = ? AND user_id = ?`,
        [
          data.portion_quantity ?? null,
          data.calories ?? null,
          data.protein ?? null,
          data.carbs ?? null,
          data.fat ?? null,
          data.fiber ?? null,
          data.meal_type ?? null,
          id,
          userId,
        ]
      );
      const [rows]: any = await this.pool.query('SELECT * FROM meal_entries WHERE id = ? AND user_id = ?', [id, userId]);
      return rows[0] || null;
    }

    const entry = this.localState.meal_entries.find((m) => m.id === Number(id) && m.user_id === Number(userId));
    if (!entry) return null;
    Object.assign(entry, data, { updated_at: now });
    this.saveLocalData();
    return { ...entry };
  }

  public async deleteMealEntry(id: number, userId: number): Promise<boolean> {
    await this.initialize();
    if (this.mode === 'mysql' && this.pool) {
      const [res]: any = await this.pool.query('DELETE FROM meal_entries WHERE id = ? AND user_id = ?', [id, userId]);
      return res.affectedRows > 0;
    }
    const idx = this.localState.meal_entries.findIndex((m) => m.id === Number(id) && m.user_id === Number(userId));
    if (idx === -1) return false;
    this.localState.meal_entries.splice(idx, 1);
    this.saveLocalData();
    return true;
  }

  public async duplicateMeal(userId: number, fromDate: string, toDate: string, mealType?: string): Promise<MealEntryRecord[]> {
    await this.initialize();
    const entries = await this.getMealEntries(userId, fromDate);
    const toDuplicate = mealType ? entries.filter((e) => e.meal_type === mealType) : entries;
    const created: MealEntryRecord[] = [];
    for (const item of toDuplicate) {
      const newEntry = await this.createMealEntry(userId, {
        date: toDate,
        meal_type: item.meal_type,
        food_id: item.food_id,
        food_name: item.food_name,
        portion_quantity: item.portion_quantity,
        portion_unit: item.portion_unit,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        fiber: item.fiber,
        sugar: item.sugar,
        sodium: item.sodium,
      });
      created.push(newEntry);
    }
    return created;
  }

  // --- Water Consumption ---
  public async getWaterEntries(userId: number, date: string): Promise<WaterEntryRecord[]> {
    await this.initialize();
    if (this.mode === 'mysql' && this.pool) {
      const [rows]: any = await this.pool.query(
        'SELECT * FROM water_entries WHERE user_id = ? AND date = ? ORDER BY created_at ASC',
        [userId, date]
      );
      return rows;
    }
    return this.localState.water_entries
      .filter((w) => w.user_id === Number(userId) && w.date === date)
      .map((w) => ({ ...w }));
  }

  public async addWaterEntry(userId: number, date: string, amount_ml: number): Promise<WaterEntryRecord> {
    await this.initialize();
    const now = new Date().toISOString();

    if (this.mode === 'mysql' && this.pool) {
      const [res]: any = await this.pool.query(
        'INSERT INTO water_entries (user_id, date, amount_ml) VALUES (?, ?, ?)',
        [userId, date, amount_ml]
      );
      const [rows]: any = await this.pool.query('SELECT * FROM water_entries WHERE id = ?', [res.insertId]);
      return rows[0];
    }

    const entry: WaterEntryRecord = {
      id: this.localState.nextId.water_entries++,
      user_id: Number(userId),
      date,
      amount_ml,
      created_at: now,
    };
    this.localState.water_entries.push(entry);
    this.saveLocalData();
    return { ...entry };
  }

  public async deleteWaterEntry(id: number, userId: number): Promise<boolean> {
    await this.initialize();
    if (this.mode === 'mysql' && this.pool) {
      const [res]: any = await this.pool.query('DELETE FROM water_entries WHERE id = ? AND user_id = ?', [id, userId]);
      return res.affectedRows > 0;
    }
    const idx = this.localState.water_entries.findIndex((w) => w.id === Number(id) && w.user_id === Number(userId));
    if (idx === -1) return false;
    this.localState.water_entries.splice(idx, 1);
    this.saveLocalData();
    return true;
  }

  // --- Weight Progress ---
  public async getWeightEntries(userId: number, limit: number = 90): Promise<WeightEntryRecord[]> {
    await this.initialize();
    if (this.mode === 'mysql' && this.pool) {
      const [rows]: any = await this.pool.query(
        'SELECT * FROM weight_entries WHERE user_id = ? ORDER BY date ASC, created_at ASC LIMIT ?',
        [userId, limit]
      );
      return rows;
    }
    return this.localState.weight_entries
      .filter((w) => w.user_id === Number(userId))
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .slice(-limit)
      .map((w) => ({ ...w }));
  }

  public async addWeightEntry(userId: number, date: string, weight_kg: number, notes?: string): Promise<WeightEntryRecord> {
    await this.initialize();
    const now = new Date().toISOString();

    if (this.mode === 'mysql' && this.pool) {
      const [res]: any = await this.pool.query(
        'INSERT INTO weight_entries (user_id, date, weight_kg, notes) VALUES (?, ?, ?, ?)',
        [userId, date, weight_kg, notes || null]
      );
      // update profile current_weight_kg as well
      await this.pool.query('UPDATE user_profiles SET current_weight_kg = ? WHERE user_id = ?', [weight_kg, userId]);
      const [rows]: any = await this.pool.query('SELECT * FROM weight_entries WHERE id = ?', [res.insertId]);
      return rows[0];
    }

    const entry: WeightEntryRecord = {
      id: this.localState.nextId.weight_entries++,
      user_id: Number(userId),
      date,
      weight_kg: Number(weight_kg),
      notes: notes || null,
      created_at: now,
    };
    this.localState.weight_entries.push(entry);

    // Update profile current weight
    const prof = this.localState.user_profiles.find((p) => p.user_id === Number(userId));
    if (prof) prof.current_weight_kg = Number(weight_kg);

    this.saveLocalData();
    return { ...entry };
  }

  public async deleteWeightEntry(id: number, userId: number): Promise<boolean> {
    await this.initialize();
    if (this.mode === 'mysql' && this.pool) {
      const [res]: any = await this.pool.query('DELETE FROM weight_entries WHERE id = ? AND user_id = ?', [id, userId]);
      return res.affectedRows > 0;
    }
    const idx = this.localState.weight_entries.findIndex((w) => w.id === Number(id) && w.user_id === Number(userId));
    if (idx === -1) return false;
    this.localState.weight_entries.splice(idx, 1);
    this.saveLocalData();
    return true;
  }

  // --- Meal Plans ---
  public async getMealPlans(userId: number): Promise<MealPlanRecord[]> {
    await this.initialize();
    if (this.mode === 'mysql' && this.pool) {
      const [plans]: any = await this.pool.query(
        'SELECT * FROM meal_plans WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      for (const p of plans) {
        const [items]: any = await this.pool.query('SELECT * FROM meal_plan_items WHERE meal_plan_id = ?', [p.id]);
        p.items = items;
      }
      return plans;
    }

    const plans = this.localState.meal_plans
      .filter((p) => p.user_id === Number(userId))
      .map((p) => {
        const items = this.localState.meal_plan_items.filter((item) => item.meal_plan_id === p.id);
        return { ...p, items };
      });
    return plans;
  }

  public async createMealPlan(
    userId: number,
    data: {
      title: string;
      day_of_week?: string;
      notes?: string;
      items: Array<{
        meal_type: string;
        food_id?: number | null;
        food_name: string;
        portion_quantity: number;
        portion_unit: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      }>;
    }
  ): Promise<MealPlanRecord> {
    await this.initialize();
    const now = new Date().toISOString();

    if (this.mode === 'mysql' && this.pool) {
      const [res]: any = await this.pool.query(
        'INSERT INTO meal_plans (user_id, title, day_of_week, notes) VALUES (?, ?, ?, ?)',
        [userId, data.title, data.day_of_week || 'any', data.notes || null]
      );
      const planId = res.insertId;
      for (const item of data.items) {
        await this.pool.query(
          `INSERT INTO meal_plan_items (
            meal_plan_id, meal_type, food_id, food_name, portion_quantity, portion_unit, calories, protein, carbs, fat
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            planId,
            item.meal_type,
            item.food_id || null,
            item.food_name,
            item.portion_quantity,
            item.portion_unit,
            item.calories,
            item.protein,
            item.carbs,
            item.fat,
          ]
        );
      }
      const [plans]: any = await this.pool.query('SELECT * FROM meal_plans WHERE id = ?', [planId]);
      const [items]: any = await this.pool.query('SELECT * FROM meal_plan_items WHERE meal_plan_id = ?', [planId]);
      plans[0].items = items;
      return plans[0];
    }

    const newPlan: MealPlanRecord = {
      id: this.localState.nextId.meal_plans++,
      user_id: Number(userId),
      title: data.title,
      day_of_week: data.day_of_week || 'any',
      notes: data.notes || null,
      created_at: now,
      updated_at: now,
    };
    this.localState.meal_plans.push(newPlan);

    const insertedItems: MealPlanItemRecord[] = [];
    for (const it of data.items) {
      const itemRecord: MealPlanItemRecord = {
        id: this.localState.nextId.meal_plan_items++,
        meal_plan_id: newPlan.id,
        meal_type: it.meal_type,
        food_id: it.food_id ? Number(it.food_id) : null,
        food_name: it.food_name,
        portion_quantity: it.portion_quantity,
        portion_unit: it.portion_unit,
        calories: it.calories,
        protein: it.protein,
        carbs: it.carbs,
        fat: it.fat,
      };
      this.localState.meal_plan_items.push(itemRecord);
      insertedItems.push(itemRecord);
    }
    this.saveLocalData();
    return { ...newPlan, items: insertedItems };
  }

  public async deleteMealPlan(id: number, userId: number): Promise<boolean> {
    await this.initialize();
    if (this.mode === 'mysql' && this.pool) {
      const [res]: any = await this.pool.query('DELETE FROM meal_plans WHERE id = ? AND user_id = ?', [id, userId]);
      return res.affectedRows > 0;
    }
    const planIdx = this.localState.meal_plans.findIndex((p) => p.id === Number(id) && p.user_id === Number(userId));
    if (planIdx === -1) return false;
    this.localState.meal_plans.splice(planIdx, 1);
    this.localState.meal_plan_items = this.localState.meal_plan_items.filter((item) => item.meal_plan_id !== Number(id));
    this.saveLocalData();
    return true;
  }

  // --- Settings ---
  public async getUserSettings(userId: number): Promise<UserSettingsRecord> {
    await this.initialize();
    const now = new Date().toISOString();
    if (this.mode === 'mysql' && this.pool) {
      const [rows]: any = await this.pool.query('SELECT * FROM user_settings WHERE user_id = ? LIMIT 1', [userId]);
      if (rows[0]) return rows[0];
      await this.pool.query('INSERT IGNORE INTO user_settings (user_id) VALUES (?)', [userId]);
      const [fresh]: any = await this.pool.query('SELECT * FROM user_settings WHERE user_id = ? LIMIT 1', [userId]);
      return fresh[0];
    }
    let settings = this.localState.user_settings.find((s) => s.user_id === Number(userId));
    if (!settings) {
      settings = {
        id: this.localState.nextId.user_settings++,
        user_id: Number(userId),
        unit_system: 'metric',
        daily_water_target_ml: 2500,
        notifications_enabled: 1,
        privacy_analytics: 1,
        created_at: now,
        updated_at: now,
      };
      this.localState.user_settings.push(settings);
      this.saveLocalData();
    }
    return { ...settings };
  }

  public async updateUserSettings(userId: number, data: Partial<UserSettingsRecord>): Promise<UserSettingsRecord> {
    await this.initialize();
    const now = new Date().toISOString();
    if (this.mode === 'mysql' && this.pool) {
      await this.getUserSettings(userId); // ensure exists
      await this.pool.query(
        `UPDATE user_settings SET
          unit_system = COALESCE(?, unit_system),
          daily_water_target_ml = COALESCE(?, daily_water_target_ml),
          notifications_enabled = COALESCE(?, notifications_enabled),
          privacy_analytics = COALESCE(?, privacy_analytics)
        WHERE user_id = ?`,
        [
          data.unit_system ?? null,
          data.daily_water_target_ml ?? null,
          data.notifications_enabled ?? null,
          data.privacy_analytics ?? null,
          userId,
        ]
      );
      return (await this.getUserSettings(userId))!;
    }
    const settings = await this.getUserSettings(userId);
    const existing = this.localState.user_settings.find((s) => s.user_id === Number(userId));
    if (existing) {
      Object.assign(existing, data, { updated_at: now });
      this.saveLocalData();
      return { ...existing };
    }
    return settings;
  }

  // --- Account Deletion ---
  public async deleteUserAccount(userId: number): Promise<boolean> {
    await this.initialize();
    if (this.mode === 'mysql' && this.pool) {
      const [res]: any = await this.pool.query('DELETE FROM users WHERE id = ?', [userId]);
      return res.affectedRows > 0;
    }
    const uid = Number(userId);
    this.localState.users = this.localState.users.filter((u) => u.id !== uid);
    this.localState.user_profiles = this.localState.user_profiles.filter((p) => p.user_id !== uid);
    this.localState.user_settings = this.localState.user_settings.filter((s) => s.user_id !== uid);
    this.localState.meal_entries = this.localState.meal_entries.filter((m) => m.user_id !== uid);
    this.localState.water_entries = this.localState.water_entries.filter((w) => w.user_id !== uid);
    this.localState.weight_entries = this.localState.weight_entries.filter((w) => w.user_id !== uid);
    this.localState.food_favorites = this.localState.food_favorites.filter((f) => f.user_id !== uid);

    const planIds = this.localState.meal_plans.filter((p) => p.user_id === uid).map((p) => p.id);
    this.localState.meal_plans = this.localState.meal_plans.filter((p) => p.user_id !== uid);
    this.localState.meal_plan_items = this.localState.meal_plan_items.filter((item) => !planIds.includes(item.meal_plan_id));

    this.saveLocalData();
    return true;
  }
}

export const db = new NutriTrackDatabase();
