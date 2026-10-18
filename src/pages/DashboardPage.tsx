import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { MetricCard } from '../components/common/MetricCard.tsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.tsx';
import {
  Flame,
  Droplets,
  Plus,
  Camera,
  Search,
  Sparkles,
  TrendingUp,
  Utensils,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Calendar,
  AlertCircle,
  Scale,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Quick weight logger modal state
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [quickWeight, setQuickWeight] = useState('');
  const [quickWeightNotes, setQuickWeightNotes] = useState('');
  const [submittingWeight, setSubmittingWeight] = useState(false);

  const fetchDashboard = async (dateStr: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboard(dateStr);
      if (res.success) {
        setData(res);
      }
    } catch (err: any) {
      console.error('[Dashboard fetch]', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(selectedDate);
  }, [selectedDate]);

  const changeDateBy = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleQuickWater = async (ml: number) => {
    try {
      await api.addWater(ml, selectedDate);
      fetchDashboard(selectedDate);
    } catch (err: any) {
      alert(err.message || 'Failed to add water');
    }
  };

  const handleDeleteMeal = async (id: number) => {
    if (!confirm('Remove this food item from your diary?')) return;
    try {
      await api.deleteMeal(id);
      fetchDashboard(selectedDate);
    } catch (err: any) {
      alert(err.message || 'Failed to delete item');
    }
  };

  const handleSaveWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickWeight) return;
    try {
      setSubmittingWeight(true);
      await api.addWeight(parseFloat(quickWeight), selectedDate, quickWeightNotes);
      setShowWeightModal(false);
      setQuickWeight('');
      setQuickWeightNotes('');
      fetchDashboard(selectedDate);
    } catch (err: any) {
      alert(err.message || 'Failed to save weight');
    } finally {
      setSubmittingWeight(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="content-wrapper">
        <div style={{ marginBottom: '2rem' }}>
          <div className="skeleton" style={{ height: '32px', width: '280px', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ height: '20px', width: '180px' }} />
        </div>
        <LoadingSkeleton rows={4} height="90px" />
      </div>
    );
  }

  const totals = data?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0, water_ml: 0 };
  const targets = data?.targets || { calories: 2000, protein: 120, carbs: 220, fat: 65, water_ml: 2500 };
  const remaining = data?.remaining || { calories: 2000, protein: 120, carbs: 220, fat: 65, water_ml: 2500 };
  const meals = data?.meals || { breakfast: [], morning_snack: [], lunch: [], evening_snack: [], dinner: [] };
  const calorieHistory = data?.calorieHistory || [];
  const recentWeight = data?.recentWeight || [];

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="content-wrapper fade-in">
      {/* Top Header & Date Bar */}
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
            Welcome back, {user?.name || 'Friend'}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {isToday ? "Here is today's nutritional summary and progress." : `Viewing historical records for ${selectedDate}`}
          </p>
        </div>

        {/* Date Navigator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#ffffff',
            padding: '0.35rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <button
            onClick={() => changeDateBy(-1)}
            style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}
            title="Previous Day"
          >
            <ChevronLeft size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.9rem' }}>
            <Calendar size={16} color="var(--primary)" />
            <span>{isToday ? 'Today' : selectedDate}</span>
          </div>

          <button
            onClick={() => changeDateBy(1)}
            style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}
            title="Next Day"
          >
            <ChevronRight size={18} />
          </button>

          {!isToday && (
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="btn btn-outline-primary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
            >
              Today
            </button>
          )}
        </div>
      </div>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--accent-rose-light)',
            color: '#9f1239',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Calorie Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
          color: '#ffffff',
          padding: '2rem',
          marginBottom: '1.75rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a7f3d0' }}>
              Daily Energy Balance
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: 850, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {Math.abs(remaining.calories)}
              </span>
              <span style={{ fontSize: '1.15rem', color: '#d1fae5', fontWeight: 600 }}>
                {remaining.calories >= 0 ? 'calories remaining' : 'calories over target'}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#a7f3d0', marginTop: '0.5rem' }}>
              Goal: {targets.calories} kcal • Consumed: {totals.calories} kcal
            </p>
          </div>

          {/* Quick Action Shortcuts inside Banner */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Link
              to="/food-search"
              className="btn btn-sm"
              style={{ backgroundColor: '#ffffff', color: '#064e3b', fontWeight: 700 }}
            >
              <Plus size={16} />
              <span>Log Food</span>
            </Link>
            <Link
              to="/food-scanner"
              className="btn btn-sm"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)' }}
            >
              <Camera size={16} />
              <span>AI Scan Photo</span>
            </Link>
            <button
              onClick={() => setShowWeightModal(true)}
              className="btn btn-sm"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)' }}
            >
              <Scale size={16} />
              <span>Record Weight</span>
            </button>
          </div>
        </div>
      </div>

      {/* Macronutrient Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <MetricCard
          title="Protein"
          consumed={totals.protein}
          target={targets.protein}
          unit="g"
          color="#0284c7"
          icon={<Flame size={20} />}
        />
        <MetricCard
          title="Carbohydrates"
          consumed={totals.carbs}
          target={targets.carbs}
          unit="g"
          color="#d97706"
          icon={<Utensils size={20} />}
        />
        <MetricCard
          title="Healthy Fats"
          consumed={totals.fat}
          target={targets.fat}
          unit="g"
          color="#9333ea"
          icon={<Sparkles size={20} />}
        />
        <MetricCard
          title="Hydration"
          consumed={totals.water_ml}
          target={targets.water_ml}
          unit="ml"
          color="#0ea5e9"
          icon={<Droplets size={20} />}
        />
      </div>

      {/* Water Quick Log Widget */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ backgroundColor: '#0284c7', color: '#ffffff', borderRadius: '10px', padding: '0.5rem' }}>
            <Droplets size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0369a1' }}>
              Hydration Tracker ({totals.water_ml} / {targets.water_ml} ml)
            </div>
            <div style={{ fontSize: '0.8rem', color: '#0284c7' }}>
              Quickly record a glass or bottle of water for {isToday ? 'today' : selectedDate}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { label: '+150 ml (Small Cup)', amount: 150 },
            { label: '+250 ml (Standard Glass)', amount: 250 },
            { label: '+500 ml (Bottle)', amount: 500 },
          ].map((w) => (
            <button
              key={w.amount}
              onClick={() => handleQuickWater(w.amount)}
              className="btn btn-sm"
              style={{
                backgroundColor: '#ffffff',
                color: '#0284c7',
                border: '1px solid #7dd3fc',
                fontWeight: 600,
              }}
            >
              {w.label}
            </button>
          ))}
          <Link to="/water-tracker" className="btn btn-sm btn-outline-primary" style={{ borderColor: '#0284c7', color: '#0284c7' }}>
            Full Log
          </Link>
        </div>
      </div>

      {/* Charts Section: 7-Day Calorie Trends & Weight Progress */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* 7-Day Calorie Bar Chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              7-Day Calorie Intake
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target: {targets.calories} kcal</span>
          </div>

          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calorieHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                  }}
                  formatter={(val: any) => [`${val} kcal`, 'Calories']}
                />
                <Bar dataKey="calories" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weight Progression Chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Weight Trend
            </h3>
            <button onClick={() => setShowWeightModal(true)} className="btn btn-sm btn-outline-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
              + Log
            </button>
          </div>

          <div style={{ height: '220px', width: '100%' }}>
            {recentWeight.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recentWeight} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                    }}
                    formatter={(val: any) => [`${val} kg`, 'Weight']}
                  />
                  <Line type="monotone" dataKey="weight_kg" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No weight logs yet. Click "+ Log" to record your starting weight!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's Meals Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            {isToday ? "Today's Logged Meals" : `Meals on ${selectedDate}`}
          </h2>
          <Link to={`/food-diary?date=${selectedDate}`} className="btn btn-secondary btn-sm">
            Open Food Diary
          </Link>
        </div>

        {/* Categories breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { id: 'breakfast', label: 'Breakfast', items: meals.breakfast },
            { id: 'morning_snack', label: 'Morning Snack', items: meals.morning_snack },
            { id: 'lunch', label: 'Lunch', items: meals.lunch },
            { id: 'evening_snack', label: 'Evening Snack', items: meals.evening_snack },
            { id: 'dinner', label: 'Dinner', items: meals.dinner },
          ].map((cat) => {
            const catCals = cat.items.reduce((sum: number, it: any) => sum + Number(it.calories), 0);
            return (
              <div key={cat.id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: cat.items.length > 0 ? '0.85rem' : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{cat.label}</span>
                    <span className="badge badge-info">{Math.round(catCals)} kcal</span>
                  </div>
                  <Link
                    to={`/food-search?meal=${cat.id}&date=${selectedDate}`}
                    className="btn btn-sm btn-outline-primary"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
                  >
                    + Add Food
                  </Link>
                </div>

                {cat.items.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {cat.items.map((item: any) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          backgroundColor: 'var(--bg-subtle)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                            {item.food_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {item.portion_quantity} {item.portion_unit} • P: {item.protein}g • C: {item.carbs}g • F: {item.fat}g
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>
                            {Math.round(item.calories)} kcal
                          </span>
                          <button
                            onClick={() => handleDeleteMeal(item.id)}
                            style={{ color: '#94a3b8', padding: '0.2rem' }}
                            title="Delete entry"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.25rem' }}>
                    No foods logged for {cat.label.toLowerCase()} yet.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Weight Entry Modal */}
      {showWeightModal && (
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Record Weight
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Track regular morning weigh-ins for consistent trend analytics.
            </p>

            <form onSubmit={handleSaveWeight} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="300"
                  placeholder="e.g. 71.4"
                  value={quickWeight}
                  onChange={(e) => setQuickWeight(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Notes (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. After morning run, well hydrated"
                  value={quickWeightNotes}
                  onChange={(e) => setQuickWeightNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowWeightModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWeight}
                  className="btn btn-primary btn-sm"
                >
                  {submittingWeight ? 'Saving...' : 'Save Weight'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
