import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Camera, Droplets, User } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const items = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/food-diary', label: 'Diary', icon: UtensilsCrossed },
    { to: '/food-scanner', label: 'AI Scan', icon: Camera, highlight: true },
    { to: '/water-tracker', label: 'Water', icon: Droplets },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0.5rem 0.25rem',
        zIndex: 50,
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.2rem',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: isActive ? 600 : 500,
              textDecoration: 'none',
              padding: '0.25rem 0.5rem',
            })}
          >
            {item.highlight ? (
              <div
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  borderRadius: '50%',
                  padding: '0.45rem',
                  marginTop: '-1rem',
                  boxShadow: '0 4px 10px rgba(16, 185, 129, 0.4)',
                }}
              >
                <Icon size={20} />
              </div>
            ) : (
              <Icon size={20} />
            )}
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
