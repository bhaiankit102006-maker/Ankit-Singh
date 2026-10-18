import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api.ts';
import { calculatePortionNutrition } from '../utils/nutritionCalculations.ts';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.tsx';
import {
  Search,
  Plus,
  Star,
  Check,
  Filter,
  Flame,
  Info,
  Apple,
  X,
  Layers,
} from 'lucide-react';

export const FoodSearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialMeal = searchParams.get('meal') || 'lunch';
  const initialDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [foods, setFoods] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Selected Food for Add-to-Diary Modal
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [portion, setPortion] = useState<number>(100);
  const [targetMeal, setTargetMeal] = useState<string>(initialMeal);
  const [targetDate, setTargetDate] = useState<string>(initialDate);
  const [logging, setLogging] = useState<boolean>(false);
  const [logSuccess, setLogSuccess] = useState<string | null>(null);

  // Custom Food Modal
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customForm, setCustomForm] = useState({
    name: '',
    brand: '',
    category: 'General',
    serving_size: 100,
    serving_unit: 'g',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    sugar: '',
    sodium: '',
  });
  const [savingCustom, setSavingCustom] = useState(false);

  const categories = [
    'All',
    'Grains & Cereals',
    'Meat & Poultry',
    'Eggs & Poultry',
    'Seafood',
    'Dairy & Alternatives',
    'Plant Protein',
    'Vegetables & Roots',
    'Fruits',
    'Nuts & Seeds',
    'Beverages',
  ];

  const searchDatabase = async () => {
    try {
      setLoading(true);
      const res = await api.searchFoods({ search: query, category: selectedCategory });
      if (res.success) {
        setFoods(res.foods);
      }
    } catch (err) {
      console.error('[Food Search error]', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const res = await api.getFavorites();
      if (res.success && Array.isArray(res.favorites)) {
        setFavorites(res.favorites.map((f: any) => f.id));
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    searchDatabase();
    loadFavorites();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchDatabase();
  };

  const toggleFavorite = async (foodId: number) => {
    try {
      if (favorites.includes(foodId)) {
        await api.removeFavorite(foodId);
        setFavorites(favorites.filter((id) => id !== foodId));
      } else {
        await api.addFavorite(foodId);
        setFavorites([...favorites, foodId]);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update favorite');
    }
  };

  const handleSelectFood = (food: any) => {
    setSelectedFood(food);
    setPortion(food.serving_size || 100);
    setLogSuccess(null);
  };

  const handleLogToDiary = async () => {
    if (!selectedFood) return;
    try {
      setLogging(true);
      const scaled = calculatePortionNutrition(selectedFood.serving_size, portion, {
        calories: selectedFood.calories,
        protein: selectedFood.protein,
        carbs: selectedFood.carbs,
        fat: selectedFood.fat,
        fiber: selectedFood.fiber,
        sugar: selectedFood.sugar,
        sodium: selectedFood.sodium,
      });

      await api.addMeal({
        date: targetDate,
        meal_type: targetMeal,
        food_id: selectedFood.id,
        food_name: selectedFood.name,
        portion_quantity: portion,
        portion_unit: selectedFood.serving_unit || 'g',
        calories: scaled.calories,
        protein: scaled.protein,
        carbs: scaled.carbs,
        fat: scaled.fat,
        fiber: scaled.fiber,
        sugar: scaled.sugar,
        sodium: scaled.sodium,
      });

      setLogSuccess(`Added ${portion}${selectedFood.serving_unit || 'g'} of ${selectedFood.name} to ${targetMeal}!`);
      setTimeout(() => {
        setSelectedFood(null);
        setLogSuccess(null);
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to log meal');
    } finally {
      setLogging(false);
    }
  };

  const handleSaveCustomFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.name || !customForm.calories) {
      alert('Food name and calories are required');
      return;
    }
    try {
      setSavingCustom(true);
      const res = await api.createCustomFood({
        name: customForm.name,
        brand: customForm.brand || null,
        category: customForm.category,
        serving_size: Number(customForm.serving_size) || 100,
        serving_unit: customForm.serving_unit || 'g',
        calories: parseFloat(customForm.calories) || 0,
        protein: parseFloat(customForm.protein) || 0,
        carbs: parseFloat(customForm.carbs) || 0,
        fat: parseFloat(customForm.fat) || 0,
        fiber: parseFloat(customForm.fiber) || 0,
        sugar: parseFloat(customForm.sugar) || 0,
        sodium: parseFloat(customForm.sodium) || 0,
      });

      if (res.success && res.food) {
        setShowCustomModal(false);
        setCustomForm({
          name: '',
          brand: '',
          category: 'General',
          serving_size: 100,
          serving_unit: 'g',
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
          fiber: '',
          sugar: '',
          sodium: '',
        });
        searchDatabase();
        handleSelectFood(res.food);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save custom food');
    } finally {
      setSavingCustom(false);
    }
  };

  // Preview scaled calculation for active modal
  const previewNutrition = selectedFood
    ? calculatePortionNutrition(selectedFood.serving_size, portion, {
        calories: selectedFood.calories,
        protein: selectedFood.protein,
        carbs: selectedFood.carbs,
        fat: selectedFood.fat,
        fiber: selectedFood.fiber,
        sugar: selectedFood.sugar,
        sodium: selectedFood.sodium,
      })
    : null;

  return (
    <div className="content-wrapper fade-in">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Nutrition Database
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Search verified whole foods and brand items, or record custom family recipes.
          </p>
        </div>

        <button
          onClick={() => setShowCustomModal(true)}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} />
          <span>Create Custom Food</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Search by name, brand, or ingredient (e.g. Oatmeal, Chicken, Greek Yogurt)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem', height: '46px', fontSize: '0.95rem' }}
          />
          <Search
            size={18}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem', height: '46px' }}>
          Search
        </button>
      </form>

      {/* Category Pills */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '1.75rem',
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.825rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              backgroundColor: selectedCategory === cat ? 'var(--primary)' : '#ffffff',
              color: selectedCategory === cat ? '#ffffff' : 'var(--text-muted)',
              border: selectedCategory === cat ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Food Results Grid */}
      {loading ? (
        <LoadingSkeleton rows={6} height="70px" />
      ) : foods.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {foods.map((food) => {
            const isFav = favorites.includes(food.id);
            return (
              <div
                key={food.id}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  border: selectedFood?.id === food.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{food.name}</span>
                      {food.brand && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Brand: {food.brand}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => toggleFavorite(food.id)}
                      style={{ color: isFav ? '#f59e0b' : '#cbd5e1', padding: '0.2rem' }}
                      title={isFav ? 'Remove Favorite' : 'Add to Favorites'}
                    >
                      <Star size={18} fill={isFav ? '#f59e0b' : 'none'} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                      {food.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Ref: {food.serving_size} {food.serving_unit}
                    </span>
                  </div>

                  {/* Macro Summary */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '0.5rem',
                      marginTop: '0.75rem',
                      backgroundColor: 'var(--bg-main)',
                      padding: '0.5rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      textAlign: 'center',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Cals</span>
                      <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{Math.round(food.calories)}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Prot</span>
                      <div style={{ fontWeight: 700, color: '#0284c7' }}>{food.protein}g</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Carb</span>
                      <div style={{ fontWeight: 700, color: '#d97706' }}>{food.carbs}g</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Fat</span>
                      <div style={{ fontWeight: 700, color: '#9333ea' }}>{food.fat}g</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectFood(food)}
                  className="btn btn-outline-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Plus size={16} />
                  <span>Log Portion to Diary</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <Apple size={36} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            No foods found matching "{query}"
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Try a different search term or add this item as a custom food to your private catalog.
          </p>
          <button onClick={() => setShowCustomModal(true)} className="btn btn-primary btn-sm">
            Create Custom Food
          </button>
        </div>
      )}

      {/* Add To Diary Modal */}
      {selectedFood && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 100,
          }}
        >
          <div className="card fade-in" style={{ maxWidth: '460px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Log to Food Diary
                </h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--primary-dark)', fontWeight: 600 }}>
                  {selectedFood.name}
                </span>
              </div>
              <button onClick={() => setSelectedFood(null)} style={{ color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            {logSuccess && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary-dark)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <Check size={18} />
                <span>{logSuccess}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Meal Window
                  </label>
                  <select value={targetMeal} onChange={(e) => setTargetMeal(e.target.value)}>
                    <option value="breakfast">Breakfast</option>
                    <option value="morning_snack">Morning Snack</option>
                    <option value="lunch">Lunch</option>
                    <option value="evening_snack">Evening Snack</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Portion Quantity ({selectedFood.serving_unit || 'g'})
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Ref size: {selectedFood.serving_size} {selectedFood.serving_unit}
                  </span>
                </div>
                <input
                  type="number"
                  step="5"
                  min="1"
                  value={portion}
                  onChange={(e) => setPortion(parseFloat(e.target.value) || 0)}
                  style={{ fontSize: '1.1rem', fontWeight: 700 }}
                />
              </div>

              {/* Dynamic Proportional Recalculation Preview */}
              {previewNutrition && (
                <div
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Calculated Nutrition for {portion} {selectedFood.serving_unit || 'g'}:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Calories</span>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-dark)' }}>
                        {previewNutrition.calories}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Protein</span>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0284c7' }}>
                        {previewNutrition.protein}g
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Carbs</span>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#d97706' }}>
                        {previewNutrition.carbs}g
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fat</span>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#9333ea' }}>
                        {previewNutrition.fat}g
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setSelectedFood(null)} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button
                onClick={handleLogToDiary}
                disabled={logging || portion <= 0}
                className="btn btn-primary btn-sm"
              >
                {logging ? 'Logging...' : 'Confirm & Log to Diary'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Food Modal */}
      {showCustomModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 100,
            overflowY: 'auto',
          }}
        >
          <div className="card fade-in" style={{ maxWidth: '540px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Create Custom Food Item
              </h3>
              <button onClick={() => setShowCustomModal(false)} style={{ color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomFood} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Food Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Grandma's Lentil Soup"
                    value={customForm.name}
                    onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Brand (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Homemade"
                    value={customForm.brand}
                    onChange={(e) => setCustomForm({ ...customForm, brand: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Category
                  </label>
                  <select
                    value={customForm.category}
                    onChange={(e) => setCustomForm({ ...customForm, category: e.target.value })}
                  >
                    <option value="General">General</option>
                    <option value="Grains & Cereals">Grains &amp; Cereals</option>
                    <option value="Meat & Poultry">Meat &amp; Poultry</option>
                    <option value="Dairy & Alternatives">Dairy</option>
                    <option value="Plant Protein">Plant Protein</option>
                    <option value="Vegetables & Roots">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Nuts & Seeds">Nuts &amp; Seeds</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Serving Size
                  </label>
                  <input
                    type="number"
                    value={customForm.serving_size}
                    onChange={(e) => setCustomForm({ ...customForm, serving_size: parseFloat(e.target.value) || 100 })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Serving Unit
                  </label>
                  <input
                    type="text"
                    value={customForm.serving_unit}
                    onChange={(e) => setCustomForm({ ...customForm, serving_unit: e.target.value })}
                  />
                </div>
              </div>

              {/* Nutrition Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    Calories (kcal)*
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="250"
                    value={customForm.calories}
                    onChange={(e) => setCustomForm({ ...customForm, calories: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="12"
                    value={customForm.protein}
                    onChange={(e) => setCustomForm({ ...customForm, protein: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="30"
                    value={customForm.carbs}
                    onChange={(e) => setCustomForm({ ...customForm, carbs: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="6"
                    value={customForm.fat}
                    onChange={(e) => setCustomForm({ ...customForm, fat: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCustom}
                  className="btn btn-primary btn-sm"
                >
                  {savingCustom ? 'Saving Food...' : 'Save & Select'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
