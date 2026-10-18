import React from 'react';

interface MetricCardProps {
  title: string;
  consumed: number;
  target: number;
  unit?: string;
  color?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  consumed,
  target,
  unit = 'g',
  color = 'var(--primary)',
  subtitle,
  icon,
}) => {
  const percentage = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;
  const remaining = Math.max(0, Math.round((target - consumed) * 10) / 10);

  return (
    <div className="card" style={{ padding: '1.25rem', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{title}</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '0.2rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {consumed}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              / {target} {unit}
            </span>
          </div>
        </div>
        {icon && (
          <div
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: `${color}15`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-bg" style={{ height: '7px', marginBottom: '0.5rem' }}>
        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <span>{percentage}% of goal</span>
        <span>{subtitle || `${remaining} ${unit} left`}</span>
      </div>
    </div>
  );
};
