import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.tsx';
import {
  CalendarDays,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  Calendar,
  X,
  Layers,
} from 'lucide-react';

export const MealPlannerPage: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Plan Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('any');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<any[]>([
    { meal_type: 'breakfast', food_name: 'Rolled Oats with Berries', portion_quantity: 150, portion_unit: 'g', calories: 280, protein: 12, carbs: 48, fat: 5 },
    { meal_type: 'lunch', food_name: 'Grilled Chicken & Quinoa Bowl', portion_quantity: 250, portion_unit: 'g', calories: 420, protein: 38, carbs: 36, fat: 12 },
    { meal_type: 'dinner', food_name: 'Steamed Salmon with Broccoli', portion_quantity: 220, portion_unit: 'g', calories: 380, protein: 32, carbs: 14, fat: 18 },
  ]);
  const [savingPlan, setSavingPlan] = useState(false);

  // Apply to diary state
  const [applyingPlanId, setApplyingPlanId] = useState<number | null>(null);
  const [applyDate, setApplyDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.getMealPlans();
      if (res.success) {
        setPlans(res.plans);
      }
    } catch (err) {
      console.error('[MealPlans fetch]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleAddItemToForm = () => {
    setItems([
      ...items,
      { meal_type: 'lunch', food_name: 'New Planned Item', portion_quantity: 100, portion_unit: 'g', calories: 150, protein: 10, carbs: 20, fat: 4 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    setItems(updated);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || items.length === 0) {
      alert('Please provide a title and at least one item');
      return;
    }

    try {
      setSavingPlan(true);
      await api.createMealPlan({
        title: title.trim(),
        day_of_week: dayOfWeek,
        notes: notes.trim() || null,
        items,
      });

      setShowModal(false);
      setTitle('');
      setNotes('');
      fetchPlans();
    } catch (err: any) {
      alert(err.message || 'Failed to save meal plan');
    } finally {
      setSavingPlan(false);
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (!confirm('Delete this meal plan?')) return;
    try {
      await api.deleteMealPlan(id);
      fetchPlans();
    } catch (err: any) {
      alert(err.message || 'Failed to delete plan');
    }
  };

  const handleApplyToDiary = async (planId: number) => {
    try {
      setApplyingPlanId(planId);
      const res = await api.applyMealPlan(planId, applyDate);
      if (res.success) {
        setApplySuccessMsg(res.message);
        setTimeout(() => setApplySuccessMsg(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to apply meal plan to diary');
    } finally {
      setApplyingPlanId(null);
    }
  };

  // Pre-made quick templates
  const loadTemplate = (templateType: string) => {
    if (templateType === 'high_protein') {
      setTitle('High Protein Fitness Day');
      setItems([
        { meal_type: 'breakfast', food_name: 'Greek Yogurt with Whey & Almonds', portion_quantity: 200, portion_unit: 'g', calories: 310, protein: 35, carbs: 18, fat: 9 },
        { meal_type: 'morning_snack', food_name: 'Boiled Eggs (2 Large)', portion_quantity: 100, portion_unit: 'g', calories: 148, protein: 13, carbs: 1, fat: 10 },
        { meal_type: 'lunch', food_name: 'Grilled Chicken Breast with Brown Rice', portion_quantity: 300, portion_unit: 'g', calories: 480, protein: 48, carbs: 45, fat: 7 },
        { meal_type: 'dinner', food_name: 'Atlantic Salmon & Steamed Asparagus', portion_quantity: 250, portion_unit: 'g', calories: 390, protein: 36, carbs: 8, fat: 22 },
      ]);
    } else if (templateType === 'vegetarian') {
      setTitle('Plant-Powered Vegetarian Day');
      setItems([
        { meal_type: 'breakfast', food_name: 'Oatmeal with Chia & Soy Milk', portion_quantity: 200, portion_unit: 'g', calories: 290, protein: 14, carbs: 45, fat: 8 },
        { meal_type: 'lunch', food_name: 'Moong Dal & Whole Wheat Roti', portion_quantity: 250, portion_unit: 'g', calories: 380, protein: 22, carbs: 54, fat: 7 },
        { meal_type: 'dinner', food_name: 'Grilled Paneer / Tofu with Quinoa Salad', portion_quantity: 250, portion_unit: 'g', calories: 430, protein: 28, carbs: 32, fat: 20 },
      ]);
    }
  };

  return (
    <div className="content-wrapper fade-in">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Personalized Meal Planner
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Curate reusable daily eating plans and apply them directly into your food diary with a single click.
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('Custom Meal Plan');
            setShowModal(true);
          }}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} />
          <span>Create New Plan</span>
        </button>
      </div>

      {applySuccessMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary-dark)',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          <span>{applySuccessMsg}</span>
        </div>
      )}

      {/* Target Date Selector for 1-Click Diary Application */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          backgroundColor: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Calendar size={18} color="var(--primary)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            Target Date to Apply Plans to Diary:
          </span>
          <input
            type="date"
            value={applyDate}
            onChange={(e) => setApplyDate(e.target.value)}
            style={{ width: 'auto', padding: '0.4rem 0.65rem' }}
          />
        </div>

        {/* Quick Template Starters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Load Template:</span>
          <button
            onClick={() => {
              loadTemplate('high_protein');
              setShowModal(true);
            }}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem' }}
          >
            High Protein
          </button>
          <button
            onClick={() => {
              loadTemplate('vegetarian');
              setShowModal(true);
            }}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem' }}
          >
            Vegetarian
          </button>
        </div>
      </div>

      {/* Plans List */}
      {loading ? (
        <LoadingSkeleton rows={4} height="120px" />
      ) : plans.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {plans.map((plan) => {
            const planItems = plan.items || [];
            const planCalories = planItems.reduce((acc: number, cur: any) => acc + Number(cur.calories), 0);
            const planProtein = planItems.reduce((acc: number, cur: any) => acc + Number(cur.protein), 0);
            const planCarbs = planItems.reduce((acc: number, cur: any) => acc + Number(cur.carbs), 0);
            const planFat = planItems.reduce((acc: number, cur: any) => acc + Number(cur.fat), 0);

            return (
              <div key={plan.id} className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                        {plan.title}
                      </h3>
                      <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                        {plan.day_of_week === 'any' ? 'Any Day' : plan.day_of_week}
                      </span>
                    </div>
                    {plan.notes && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {plan.notes}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                      onClick={() => handleApplyToDiary(plan.id)}
                      disabled={applyingPlanId === plan.id}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <CheckCircle2 size={16} />
                      <span>{applyingPlanId === plan.id ? 'Applying...' : `Apply to ${applyDate}`}</span>
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#ef4444' }}
                      title="Delete Plan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Macro summary */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1.25rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    padding: '0.65rem 1rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1.25rem',
                  }}
                >
                  <span style={{ color: 'var(--primary-dark)' }}>{Math.round(planCalories)} kcal Total</span>
                  <span style={{ color: '#0284c7' }}>P: {Math.round(planProtein)}g</span>
                  <span style={{ color: '#d97706' }}>C: {Math.round(planCarbs)}g</span>
                  <span style={{ color: '#9333ea' }}>F: {Math.round(planFat)}g</span>
                </div>

                {/* Items */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                  {planItems.map((it: any) => (
                    <div
                      key={it.id}
                      style={{
                        padding: '0.75rem 0.9rem',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <div style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-dark)', marginBottom: '0.2rem' }}>
                        {it.meal_type.replace('_', ' ')}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                        {it.food_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {it.portion_quantity} {it.portion_unit} • {it.calories} kcal
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <CalendarDays size={38} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
            No Meal Plans Created Yet
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
            Meal planning streamlines adherence and saves decision fatigue. Use our High Protein or Vegetarian templates to start!
          </p>
          <button
            onClick={() => {
              loadTemplate('high_protein');
              setShowModal(true);
            }}
            className="btn btn-primary btn-sm"
          >
            Create Your First Plan
          </button>
        </div>
      )}

      {/* Create Plan Modal */}
      {showModal && (
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
          <div className="card fade-in" style={{ maxWidth: '640px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                Create Meal Plan
              </h3>
              <button onClick={() => setShowModal(false)} style={{ color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePlan} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    Day of Week
                  </label>
                  <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
                    <option value="any">Any Day</option>
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  Notes / Strategy
                </label>
                <input
                  type="text"
                  placeholder="e.g. Heavy lifting day, carb refeed"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Items List */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                    Planned Foods ({items.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItemToForm}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.78rem', padding: '0.25rem 0.6rem' }}
                  >
                    + Add Item
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {items.map((it, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: 'var(--bg-main)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 1.8fr 1fr 1fr auto',
                        gap: '0.5rem',
                        alignItems: 'center',
                      }}
                    >
                      <select
                        value={it.meal_type}
                        onChange={(e) => handleItemChange(idx, 'meal_type', e.target.value)}
                        style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="morning_snack">Morning Snack</option>
                        <option value="lunch">Lunch</option>
                        <option value="evening_snack">Evening Snack</option>
                        <option value="dinner">Dinner</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Food name"
                        value={it.food_name}
                        onChange={(e) => handleItemChange(idx, 'food_name', e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                      />

                      <input
                        type="number"
                        placeholder="Portion (g)"
                        value={it.portion_quantity}
                        onChange={(e) => handleItemChange(idx, 'portion_quantity', parseFloat(e.target.value) || 0)}
                        style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                      />

                      <input
                        type="number"
                        placeholder="Calories"
                        value={it.calories}
                        onChange={(e) => handleItemChange(idx, 'calories', parseFloat(e.target.value) || 0)}
                        style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        style={{ color: '#ef4444', padding: '0.3rem' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPlan}
                  className="btn btn-primary btn-sm"
                >
                  {savingPlan ? 'Saving...' : 'Save Meal Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
