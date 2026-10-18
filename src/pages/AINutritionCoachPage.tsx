import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Sparkles,
  Send,
  Flame,
  Apple,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';

export const AINutritionCoachPage: React.FC = () => {
  const { user, profile } = useAuth();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [adviceResult, setAdviceResult] = useState<any | null>(null);
  const [todayTotals, setTodayTotals] = useState<any>({ calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });
  const [error, setError] = useState<string | null>(null);

  // Load today's totals for grounding
  useEffect(() => {
    api.getDashboard().then((res) => {
      if (res.success && res.totals) {
        setTodayTotals(res.totals);
      }
    }).catch(() => {});
  }, []);

  const samplePrompts = [
    'What should I eat for dinner with my remaining calories and protein?',
    'Suggest high-protein snacks that match my dietary preference',
    'How can I hit my fiber target today without spiking carbs?',
    'Give me a balanced meal idea for post-workout recovery',
  ];

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.getNutritionAdvice(questionText, todayTotals);
      if (res.success && res.result) {
        setAdviceResult(res.result);
      } else {
        throw new Error('No advice received');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get nutrition recommendations');
    } finally {
      setLoading(false);
    }
  };

  const remainingCals = Math.max(0, (profile?.daily_calorie_target || 2000) - todayTotals.calories);
  const remainingProt = Math.max(0, (profile?.protein_target_g || 120) - todayTotals.protein);

  return (
    <div className="content-wrapper fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <div className="badge badge-purple" style={{ marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Sparkles size={14} /> Certified Nutrition AI Advisor
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          AI Nutrition Coach
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Ask personalized dietary questions grounded directly in your remaining macros, goal ({profile?.goal || 'Maintenance'}), and diet ({profile?.dietary_preference || 'Omnivore'}).
        </p>
      </div>

      {/* Context Pill Banner */}
      <div
        className="card"
        style={{
          padding: '1rem 1.5rem',
          backgroundColor: '#f5f3ff',
          border: '1px solid #ddd6fe',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ backgroundColor: '#8b5cf6', color: '#ffffff', borderRadius: '10px', padding: '0.45rem' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#5b21b6' }}>
              Current Context: ~{remainingCals} kcal &amp; {Math.round(remainingProt)}g protein remaining today
            </div>
            <div style={{ fontSize: '0.8rem', color: '#7c3aed' }}>
              Diet: <strong>{profile?.dietary_preference}</strong> • Allergies: <strong>{profile?.allergies || 'None logged'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
          <Lightbulb size={16} color="var(--primary)" />
          <span>Quick Questions</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(p);
                handleAsk(p);
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.825rem', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)' }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Question Form */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(query);
          }}
          style={{ display: 'flex', gap: '0.75rem' }}
        >
          <input
            type="text"
            placeholder="Type your nutrition question (e.g. What can I eat with 300 kcal and 25g protein left?)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, height: '48px' }}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn btn-primary"
            style={{ padding: '0 1.5rem', height: '48px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {loading ? <RefreshCw size={18} className="spin" /> : <Send size={18} />}
            <span>Ask Coach</span>
          </button>
        </form>
      </div>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--accent-rose-light)',
            color: '#9f1239',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Advice Display */}
      {loading ? (
        <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '3px solid var(--accent-purple-light)',
              borderTopColor: 'var(--accent-purple)',
              margin: '0 auto 1rem auto',
              animation: 'spin 1s linear infinite',
            }}
          />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
            Consulting Clinical Nutrition Guidelines...
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Analyzing remaining calorie reserves and dietary preferences with Gemini.
          </p>
        </div>
      ) : adviceResult ? (
        <div className="card fade-in" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Sparkles size={20} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              Coach Recommendations
            </h3>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-main)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              color: '#1e293b',
              marginBottom: '1.75rem',
              border: '1px solid var(--border-color)',
            }}
          >
            {adviceResult.advice}
          </div>

          {adviceResult.meal_suggestions && adviceResult.meal_suggestions.length > 0 && (
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                Suggested Meal &amp; Snack Options
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {adviceResult.meal_suggestions.map((meal: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.4rem' }}>
                      {meal.name}
                    </div>
                    {meal.why_good && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                        {meal.why_good}
                      </p>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--bg-subtle)',
                        padding: '0.45rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <span style={{ color: 'var(--primary-dark)' }}>{meal.calories} kcal</span>
                      <span style={{ color: '#0284c7' }}>P: {meal.protein}g</span>
                      <span style={{ color: '#d97706' }}>C: {meal.carbs}g</span>
                      <span style={{ color: '#9333ea' }}>F: {meal.fat}g</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
