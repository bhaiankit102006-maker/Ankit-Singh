import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Search,
  Camera,
  CalendarDays,
  Droplets,
  TrendingUp,
  User,
  Settings,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/food-diary', label: 'Food Diary', icon: UtensilsCrossed },
    { to: '/food-search', label: 'Food Database', icon: Search },
    { to: '/food-scanner', label: 'AI Food Scanner', icon: Camera, highlight: true },
    { to: '/ai-coach', label: 'AI Nutrition Coach', icon: Sparkles, badge: 'AI' },
    { to: '/meal-planner', label: 'Meal Planner', icon: CalendarDays },
    { to: '/water-tracker', label: 'Water Tracker', icon: Droplets },
    { to: '/progress', label: 'Weight & Progress', icon: TrendingUp },
    { to: '/profile', label: 'Health Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/help', label: 'Help & FAQs', icon: HelpCircle },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border-color)',
        minHeight: 'calc(100vh - 61px)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.25rem 0.75rem',
      }}
    >
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.92rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--primary-dark)' : 'var(--text-muted)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                transition: 'all 0.15s ease',
              })}
            >
              <Icon size={19} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--accent-purple-light)',
                    color: 'var(--accent-purple)',
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Daily reminder mini widget in sidebar */}
      <div
        style={{
          marginTop: 'auto',
          padding: '1rem',
          backgroundColor: 'var(--primary-light)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
        }}
      >
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>
          Daily Health Tip
        </p>
        <p style={{ fontSize: '0.75rem', color: '#065f46', lineHeight: 1.4 }}>
          Pair iron-rich plant foods with Vitamin C (like lemon on spinach or lentils) for enhanced bioavailability!
        </p>
      </div>
    </aside>
  );
};
