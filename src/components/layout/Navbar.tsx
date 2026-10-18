import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { Apple, Camera, LogOut, User as UserIcon, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand */}
        <Link
          to={isAuthenticated ? '/dashboard' : '/'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              borderRadius: '10px',
              padding: '0.45rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Apple size={22} strokeWidth={2.4} />
          </div>
          <div>
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#0f172a',
              }}
            >
              Nutri<span style={{ color: 'var(--primary)' }}>Track</span>
            </span>
          </div>
        </Link>

        {/* Actions / Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <>
              <Link
                to="/food-scanner"
                className="btn btn-outline-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Camera size={16} />
                <span>AI Scanner</span>
              </Link>
              <Link
                to="/ai-coach"
                className="btn btn-sm"
                style={{
                  backgroundColor: 'var(--accent-purple-light)',
                  color: 'var(--accent-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                }}
              >
                <Sparkles size={16} />
                <span>AI Advisor</span>
              </Link>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginLeft: '0.5rem',
                  paddingLeft: '0.75rem',
                  borderLeft: '1px solid var(--border-color)',
                }}
              >
                <Link
                  to="/profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                  title="My Profile"
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <UserIcon size={16} />
                  </div>
                  <span className="desktop-sidebar">{user?.name?.split(' ')[0]}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  style={{
                    color: 'var(--text-muted)',
                    padding: '0.4rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/features" style={{ fontSize: '0.925rem', fontWeight: 500, color: 'var(--text-muted)', padding: '0.4rem 0.6rem' }}>
                Features
              </Link>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
