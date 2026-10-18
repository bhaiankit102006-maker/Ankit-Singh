import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { calculateBMI } from '../utils/nutritionCalculations.ts';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.tsx';
import {
  Scale,
  TrendingDown,
  TrendingUp,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Award,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

export const ProgressPage: React.FC = () => {
  const { profile } = useAuth();

  const [entries, setEntries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');

  // New weight entry form
  const [logWeight, setLogWeight] = useState('');
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [logNotes, setLogNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchWeightData = async () => {
    try {
      setLoading(true);
      const res = await api.getWeight();
      if (res.success) {
        setEntries(res.entries);
        setStats(res.stats || {});
      }
    } catch (err) {
      console.error('[Weight fetch]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeightData();
  }, []);

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logWeight) return;
    try {
      setSubmitting(true);
      await api.addWeight(parseFloat(logWeight), logDate, logNotes);
      setLogWeight('');
      setLogNotes('');
      fetchWeightData();
    } catch (err: any) {
      alert(err.message || 'Failed to record weight');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this weight entry?')) return;
    try {
      await api.deleteWeight(id);
      fetchWeightData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete entry');
    }
  };

  // Filter entries by selected range
  const now = new Date();
  const daysLimit = parseInt(timeRange, 10);
  const cutoffDate = new Date();
  cutoffDate.setDate(now.getDate() - daysLimit);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  const filteredEntries = entries.filter((e) => e.date >= cutoffStr);

  const currentWeight = stats.current_weight || (entries.length > 0 ? entries[entries.length - 1].weight_kg : null);
  const startWeight = stats.start_weight || (entries.length > 0 ? entries[0].weight_kg : currentWeight);
  const targetWeight = stats.target_weight || profile?.target_weight_kg || null;

  // Calculate BMI with current weight and profile height
  const heightCm = profile?.height_cm || 170;
  const bmiInfo = currentWeight ? calculateBMI(currentWeight, heightCm) : null;

  return (
    <div className="content-wrapper fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Weight &amp; Body Metrics
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Longitudinal progress tracking with moving averages that smooth out natural hydration shifts.
        </p>
      </div>

      {/* Stats Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Current Weight</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 850, color: '#0f172a', marginTop: '0.25rem' }}>
            {currentWeight ? `${currentWeight} kg` : 'N/A'}
          </div>
          {bmiInfo && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              BMI: <strong>{bmiInfo.bmi}</strong> ({bmiInfo.category})
            </div>
          )}
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Target Goal</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 850, color: 'var(--primary-dark)', marginTop: '0.25rem' }}>
            {targetWeight ? `${targetWeight} kg` : 'Not Set'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {stats.remaining_to_target ? `${stats.remaining_to_target} kg to target` : 'Set target in profile'}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Change</span>
          <div
            style={{
              fontSize: '1.8rem',
              fontWeight: 850,
              color: stats.total_change > 0 ? '#0284c7' : stats.total_change < 0 ? '#10b981' : '#0f172a',
              marginTop: '0.25rem',
            }}
          >
            {stats.total_change !== null
              ? `${stats.total_change > 0 ? '+' : ''}${stats.total_change} kg`
              : '0 kg'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Since starting weight ({startWeight || currentWeight} kg)
          </div>
        </div>
      </div>

      {/* Chart Card */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Weight Progress Trend
            </h3>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Showing {filteredEntries.length} logged records
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--bg-main)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
            {(['7', '30', '90'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  backgroundColor: timeRange === r ? '#ffffff' : 'transparent',
                  color: timeRange === r ? 'var(--text-main)' : 'var(--text-muted)',
                  boxShadow: timeRange === r ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {r} Days
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: '280px', width: '100%' }}>
          {filteredEntries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredEntries} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                  }}
                  formatter={(val: any) => [`${val} kg`, 'Weight']}
                />
                {targetWeight && (
                  <ReferenceLine y={targetWeight} stroke="#10b981" strokeDasharray="3 3" label="Target" />
                )}
                <Line
                  type="monotone"
                  dataKey="weight_kg"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--primary)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No weight records found in the last {timeRange} days. Record an entry below.
            </div>
          )}
        </div>
      </div>

      {/* Log New Weight & History Table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
        {/* Quick Log Form */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
            Record New Weigh-In
          </h3>

          <form onSubmit={handleAddWeight} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Weight in Kilograms (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                placeholder="e.g. 69.8"
                value={logWeight}
                onChange={(e) => setLogWeight(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Date of Measurement
              </label>
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Measurement Notes (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Fasted morning weigh-in, post-rest day"
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !logWeight}
              className="btn btn-primary"
              style={{ marginTop: '0.5rem' }}
            >
              {submitting ? 'Recording...' : 'Save Weigh-In'}
            </button>
          </form>

          {/* Biological Fluid Fluctuation Educational Note */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '0.85rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <Info size={16} color="var(--primary-dark)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Weight Science:</strong> Day-to-day fluctuations of 1-2 kg are normal and primarily reflect glycogen storage water (3g water per 1g glycogen), sodium fluid retention, and gastrointestinal contents, rather than changes in fat or muscle mass.
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
            Historical Weigh-In Log
          </h3>

          {entries.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '340px', overflowY: 'auto' }}>
              {entries.slice().reverse().map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'var(--bg-main)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                      {entry.weight_kg} kg
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.65rem' }}>
                      {entry.date}
                    </span>
                    {entry.notes && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.1rem' }}>
                        {entry.notes}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(entry.id)}
                    style={{ color: '#ef4444', padding: '0.3rem' }}
                    title="Delete entry"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>
              No weigh-in logs recorded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
