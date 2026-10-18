import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api.ts';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.tsx';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Copy,
  Edit2,
  Check,
  X,
  Apple,
  Sparkles,
} from 'lucide-react';

export const FoodDiaryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const [currentDate, setCurrentDate] = useState<string>(dateParam);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Edit inline modal state
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editPortion, setEditPortion] = useState<number>(100);
  const [savingEdit, setSavingEdit] = useState<boolean>(false);

  // Duplicate modal
  const [showDuplicateModal, setShowDuplicateModal] = useState<boolean>(false);
  const [duplicateTargetDate, setDuplicateTargetDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [duplicateMealType, setDuplicateMealType] = useState<string>('all');
  const [duplicating, setDuplicating] = useState<boolean>(false);

  const fetchMeals = async (d: string) => {
    try {
      setLoading(true);
      const res = await api.getMeals(d);
      if (res.success) {
        setData(res);
      }
    } catch (err: any) {
      console.error('[Diary fetch]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals(currentDate);
    setSearchParams({ date: currentDate });
  }, [currentDate]);

  const changeDate = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this food item?')) return;
    try {
      await api.deleteMeal(id);
      fetchMeals(currentDate);
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleStartEdit = (item: any) => {
    setEditingItem(item);
    setEditPortion(item.portion_quantity);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      setSavingEdit(true);
      // scale proportionally
      const ratio = editPortion / (editingItem.portion_quantity || 100);
      const newCalories = Math.round(editingItem.calories * ratio * 10) / 10;
      const newProtein = Math.round(editingItem.protein * ratio * 10) / 10;
      const newCarbs = Math.round(editingItem.carbs * ratio * 10) / 10;
      const newFat = Math.round(editingItem.fat * ratio * 10) / 10;

      await api.updateMeal(editingItem.id, {
        portion_quantity: editPortion,
        calories: newCalories,
        protein: newProtein,
        carbs: newCarbs,
        fat: newFat,
      });

      setEditingItem(null);
      fetchMeals(currentDate);
    } catch (err: any) {
      alert(err.message || 'Failed to update entry');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      setDuplicating(true);
      await api.duplicateMeal(
        currentDate,
        duplicateTargetDate,
        duplicateMealType === 'all' ? undefined : duplicateMealType
      );
      setShowDuplicateModal(false);
      alert(`Meals successfully duplicated to ${duplicateTargetDate}!`);
    } catch (err: any) {
      alert(err.message || 'Failed to copy meal');
    } finally {
      setDuplicating(false);
    }
  };

  const totals = data?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 };
  const grouped = data?.grouped || { breakfast: [], morning_snack: [], lunch: [], evening_snack: [], dinner: [] };

  const categories = [
    { id: 'breakfast', label: 'Breakfast', items: grouped.breakfast },
    { id: 'morning_snack', label: 'Morning Snack', items: grouped.morning_snack },
    { id: 'lunch', label: 'Lunch', items: grouped.lunch },
    { id: 'evening_snack', label: 'Evening Snack', items: grouped.evening_snack },
    { id: 'dinner', label: 'Dinner', items: grouped.dinner },
  ];

  return (
    <div className="content-wrapper fade-in">
      {/* Top Header & Actions */}
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
            Daily Food Diary
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Browse and log meals across 5 structured dining windows.
          </p>
        </div>

        {/* Date Selector & Duplicate Button */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setShowDuplicateModal(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Copy size={16} />
            <span>Copy Meals</span>
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#ffffff',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <button onClick={() => changeDate(-1)} style={{ padding: '0.25rem', color: 'var(--text-muted)' }}>
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', minWidth: '100px', textAlign: 'center' }}>
              {currentDate}
            </span>
            <button onClick={() => changeDate(1)} style={{ padding: '0.25rem', color: 'var(--text-muted)' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Daily Totals Sticky Summary */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.75rem',
          backgroundColor: '#ffffff',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
          alignItems: 'center',
          borderLeft: '4px solid var(--primary)',
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
            Total Energy
          </span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
            {totals.calories} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>kcal</span>
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
            Protein
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>
            {totals.protein} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>g</span>
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
            Carbohydrates
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>
            {totals.carbs} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>g</span>
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
            Fat
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#9333ea' }}>
            {totals.fat} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>g</span>
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
            Dietary Fiber
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
            {totals.fiber} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>g</span>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} height="85px" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {categories.map((cat) => {
            const catCals = cat.items.reduce((acc: number, cur: any) => acc + Number(cur.calories), 0);
            const catProtein = cat.items.reduce((acc: number, cur: any) => acc + Number(cur.protein), 0);
            const catCarbs = cat.items.reduce((acc: number, cur: any) => acc + Number(cur.carbs), 0);
            const catFat = cat.items.reduce((acc: number, cur: any) => acc + Number(cur.fat), 0);

            return (
              <div key={cat.id} className="card" style={{ padding: '1.5rem' }}>
                {/* Meal Header */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                    paddingBottom: '0.85rem',
                    borderBottom: '1px solid var(--border-color)',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                      {cat.label}
                    </h3>
                    <span className="badge badge-success">
                      {Math.round(catCals)} kcal
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      P: {Math.round(catProtein * 10) / 10}g • C: {Math.round(catCarbs * 10) / 10}g • F: {Math.round(catFat * 10) / 10}g
                    </span>
                    <Link
                      to={`/food-search?meal=${cat.id}&date=${currentDate}`}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Plus size={16} />
                      <span>Add Food</span>
                    </Link>
                  </div>
                </div>

                {/* Items in Meal */}
                {cat.items.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {cat.items.map((item: any) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          backgroundColor: 'var(--bg-main)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        <div style={{ flex: '1 1 240px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                            {item.food_name}
                          </span>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            Portion: <strong>{item.portion_quantity} {item.portion_unit}</strong> • Protein: {item.protein}g • Carbs: {item.carbs}g • Fat: {item.fat}g
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                            {Math.round(item.calories)} kcal
                          </span>

                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.3rem 0.5rem' }}
                              title="Edit Portion"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: '0.3rem 0.5rem' }}
                              title="Delete Item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '1.5rem',
                      color: 'var(--text-muted)',
                      fontSize: '0.875rem',
                      fontStyle: 'italic',
                    }}
                  >
                    No items recorded for {cat.label.toLowerCase()}. Click "+ Add Food" to log from the database.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Portion Modal */}
      {editingItem && (
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
          <div className="card fade-in" style={{ maxWidth: '420px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
              Adjust Portion Size
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Editing <strong>{editingItem.food_name}</strong>
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Portion Amount ({editingItem.portion_unit})
              </label>
              <input
                type="number"
                step="5"
                min="1"
                value={editPortion}
                onChange={(e) => setEditPortion(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.5rem',
                fontSize: '0.85rem',
              }}
            >
              Estimated Calories:{' '}
              <strong>
                {Math.round(
                  (editingItem.calories / (editingItem.portion_quantity || 100)) * editPortion
                )}{' '}
                kcal
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setEditingItem(null)} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="btn btn-primary btn-sm"
              >
                {savingEdit ? 'Saving...' : 'Update Portion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Modal */}
      {showDuplicateModal && (
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
          <div className="card fade-in" style={{ maxWidth: '440px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
              Copy Meals to Another Date
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Duplicate your logged foods from {currentDate} into another day.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Target Destination Date
                </label>
                <input
                  type="date"
                  value={duplicateTargetDate}
                  onChange={(e) => setDuplicateTargetDate(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Which Meals to Copy?
                </label>
                <select value={duplicateMealType} onChange={(e) => setDuplicateMealType(e.target.value)}>
                  <option value="all">Entire Day (All Meals)</option>
                  <option value="breakfast">Breakfast Only</option>
                  <option value="morning_snack">Morning Snack Only</option>
                  <option value="lunch">Lunch Only</option>
                  <option value="evening_snack">Evening Snack Only</option>
                  <option value="dinner">Dinner Only</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setShowDuplicateModal(false)} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button onClick={handleDuplicate} disabled={duplicating} className="btn btn-primary btn-sm">
                {duplicating ? 'Copying...' : 'Copy to Date'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
