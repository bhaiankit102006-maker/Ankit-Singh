export const TOKEN_KEY = 'nutritrack_token';
export const USER_KEY = 'nutritrack_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredAuth(token: string, user: any) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): any | null {
  const item = localStorage.getItem(USER_KEY);
  if (!item) return null;
  try {
    return JSON.parse(item);
  } catch {
    return null;
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    if (response.status === 401) {
      // clear session if token expired
      clearStoredAuth();
    }
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  signup: (payload: { name: string; email: string; password: string }) =>
    request('/api/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  getMe: () => request('/api/auth/me'),

  // Profile
  getProfile: () => request('/api/profile'),
  updateProfile: (data: any) => request('/api/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getGoals: () => request('/api/profile/goals'),
  updateGoals: (goals: any) => request('/api/profile/goals', { method: 'PUT', body: JSON.stringify(goals) }),

  // Dashboard
  getDashboard: (date?: string) => request(`/api/dashboard${date ? `?date=${date}` : ''}`),

  // Foods
  searchFoods: (params: { search?: string; category?: string; limit?: number; offset?: number }) => {
    const q = new URLSearchParams();
    if (params.search) q.set('search', params.search);
    if (params.category && params.category !== 'All') q.set('category', params.category);
    if (params.limit) q.set('limit', params.limit.toString());
    if (params.offset) q.set('offset', params.offset.toString());
    return request(`/api/foods?${q.toString()}`);
  },
  getFood: (id: number) => request(`/api/foods/${id}`),
  createCustomFood: (foodData: any) => request('/api/foods/custom', { method: 'POST', body: JSON.stringify(foodData) }),
  getFavorites: () => request('/api/foods/favorites'),
  addFavorite: (foodId: number) => request('/api/foods/favorites', { method: 'POST', body: JSON.stringify({ foodId }) }),
  removeFavorite: (foodId: number) => request(`/api/foods/favorites/${foodId}`, { method: 'DELETE' }),

  // Meals
  getMeals: (date?: string) => request(`/api/meals${date ? `?date=${date}` : ''}`),
  addMeal: (entryData: any) => request('/api/meals', { method: 'POST', body: JSON.stringify(entryData) }),
  updateMeal: (id: number, data: any) => request(`/api/meals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMeal: (id: number) => request(`/api/meals/${id}`, { method: 'DELETE' }),
  duplicateMeal: (fromDate: string, toDate: string, mealType?: string) =>
    request('/api/meals/duplicate', { method: 'POST', body: JSON.stringify({ fromDate, toDate, mealType }) }),

  // Water
  getWater: (date?: string) => request(`/api/water${date ? `?date=${date}` : ''}`),
  addWater: (amount_ml: number, date?: string) =>
    request('/api/water', { method: 'POST', body: JSON.stringify({ amount_ml, date }) }),
  deleteWater: (id: number) => request(`/api/water/${id}`, { method: 'DELETE' }),

  // Weight
  getWeight: () => request('/api/weight'),
  addWeight: (weight_kg: number, date?: string, notes?: string) =>
    request('/api/weight', { method: 'POST', body: JSON.stringify({ weight_kg, date, notes }) }),
  deleteWeight: (id: number) => request(`/api/weight/${id}`, { method: 'DELETE' }),

  // Meal Plans
  getMealPlans: () => request('/api/meal-plans'),
  createMealPlan: (data: any) => request('/api/meal-plans', { method: 'POST', body: JSON.stringify(data) }),
  deleteMealPlan: (id: number) => request(`/api/meal-plans/${id}`, { method: 'DELETE' }),
  applyMealPlan: (id: number, date?: string) =>
    request(`/api/meal-plans/${id}/apply`, { method: 'POST', body: JSON.stringify({ date }) }),

  // AI features
  scanFoodImage: (imageBase64: string, mimeType?: string) =>
    request('/api/food-scan/analyze', { method: 'POST', body: JSON.stringify({ image: imageBase64, mimeType }) }),
  getNutritionAdvice: (query: string, todayTotals?: any) =>
    request('/api/ai/advisor', { method: 'POST', body: JSON.stringify({ query, todayTotals }) }),

  // Settings & Account
  getSettings: () => request('/api/settings'),
  updateSettings: (data: any) => request('/api/settings', { method: 'PUT', body: JSON.stringify(data) }),
  deleteAccount: (confirmation: string) =>
    request('/api/account/delete', { method: 'POST', body: JSON.stringify({ confirmation }) }),
};
