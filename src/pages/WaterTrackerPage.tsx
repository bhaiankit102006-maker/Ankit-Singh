import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.tsx';
import {
  Droplets,
  Plus,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  GlassWater,
} from 'lucide-react';

export const WaterTrackerPage: React.FC = () => {
  const { profile } = useAuth();

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchWater = async (d: string) => {
    try {
      setLoading(true);
      const res = await api.getWater(d);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('[Water fetch]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWater(date);
  }, [date]);

  const changeDate = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split('T')[0]);
  };

  const handleAddWater = async (amount: number) => {
    if (amount <= 0) return;
    try {
      setSubmitting(true);
      await api.addWater(amount, date);
      setCustomAmount('');
      fetchWater(date);
    } catch (err: any) {
      alert(err.message || 'Failed to record water');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteWater(id);
      fetchWater(date);
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const totalMl = data?.total_ml || 0;
  const targetMl = data?.target_ml || (profile?.water_target_ml || 2500);
  const percentage = Math.min(100, Math.round((totalMl / targetMl) * 100));
  const entries = data?.entries || [];

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
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Hydration Tracker
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Maintain cellular hydration and kidney filtration efficiency.
          </p>
        </div>

        {/* Date Navigator */}
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
            {date === new Date().toISOString().split('T')[0] ? 'Today' : date}
          </span>
          <button onClick={() => changeDate(1)} style={{ padding: '0.25rem', color: 'var(--text-muted)' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Main Hydration Progress Card */}
      <div
        className="card"
        style={{
          padding: '2.5rem 2rem',
          textAlign: 'center',
          marginBottom: '2rem',
          background: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)',
          border: '1px solid #bae6fd',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 8px 18px rgba(2, 132, 199, 0.25)',
          }}
        >
          <Droplets size={38} />
        </div>

        <div style={{ fontSize: '3rem', fontWeight: 850, color: '#0369a1', lineHeight: 1 }}>
          {totalMl} <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>/ {targetMl} ml</span>
        </div>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          {percentage}% of your daily recommended hydration goal completed
        </p>

        {/* Big visual progress meter */}
        <div style={{ maxWidth: '520px', margin: '0 auto 2rem auto' }}>
          <div className="progress-bar-bg" style={{ height: '14px', backgroundColor: '#e0f2fe' }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${percentage}%`,
                backgroundColor: '#0284c7',
              }}
            />
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { label: '+150 ml (Small Cup)', val: 150 },
            { label: '+250 ml (Glass)', val: 250 },
            { label: '+500 ml (Standard Bottle)', val: 500 },
            { label: '+750 ml (Sports Shaker)', val: 750 },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => handleAddWater(item.val)}
              disabled={submitting}
              className="btn btn-secondary"
              style={{
                fontSize: '0.875rem',
                padding: '0.6rem 1rem',
                border: '1px solid #7dd3fc',
                color: '#0284c7',
                fontWeight: 600,
              }}
            >
              <Plus size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Custom amount input */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', maxWidth: '340px', margin: '0 auto' }}>
          <input
            type="number"
            step="50"
            min="10"
            max="3000"
            placeholder="Custom ml (e.g. 330)"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            style={{ fontSize: '0.9rem' }}
          />
          <button
            onClick={() => handleAddWater(parseFloat(customAmount))}
            disabled={submitting || !customAmount}
            className="btn btn-primary btn-sm"
            style={{ whiteSpace: 'nowrap' }}
          >
            Add Amount
          </button>
        </div>
      </div>

      {/* Today's Logged Water Entries */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
          Intake Records for {date}
        </h3>

        {loading ? (
          <LoadingSkeleton rows={3} height="45px" />
        ) : entries.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {entries.map((entry: any) => {
              const timeStr = entry.created_at ? new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              return (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 1rem',
                    backgroundColor: 'var(--bg-main)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Droplets size={18} color="#0284c7" />
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                        +{entry.amount_ml} ml
                      </span>
                      {timeStr && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                          at {timeStr}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(entry.id)}
                    style={{ color: '#ef4444', padding: '0.3rem' }}
                    title="Delete entry"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0', fontStyle: 'italic' }}>
            No water logged yet for this date. Click one of the quick add buttons above to track your intake!
          </p>
        )}
      </div>
    </div>
  );
};
