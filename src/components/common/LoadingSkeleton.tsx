import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; height?: string }> = ({ rows = 3, height = '45px' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="skeleton" style={{ height, width: '100%', borderRadius: 'var(--radius-md)' }} />
      ))}
    </div>
  );
};
