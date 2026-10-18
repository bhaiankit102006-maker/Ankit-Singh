import React from 'react';
import { Link } from 'react-router-dom';
import { Apple, ShieldCheck, Heart, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border-color)',
        padding: '3rem 1.5rem 2rem 1.5rem',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <div style={{ backgroundColor: 'var(--primary)', color: '#ffffff', borderRadius: '8px', padding: '0.35rem' }}>
              <Apple size={20} />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              Nutri<span style={{ color: 'var(--primary)' }}>Track</span>
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
            Science-grounded nutrition tracking, meal planning, and AI food analysis designed to build sustainable dietary habits without unsustainable restrictions.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--primary-dark)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <ShieldCheck size={16} /> Data Privacy First
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Award size={16} /> Mifflin–St Jeor
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
            Features
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <li><Link to="/food-diary">Calorie &amp; Macro Diary</Link></li>
            <li><Link to="/food-scanner">AI Food Scanner</Link></li>
            <li><Link to="/meal-planner">Custom Meal Planner</Link></li>
            <li><Link to="/water-tracker">Hydration Tracking</Link></li>
            <li><Link to="/progress">Weight & Body Metrics</Link></li>
          </ul>
        </div>

        {/* Tools & Calculations */}
        <div>
          <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
            Science & Tools
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <li><Link to="/onboarding">BMR & TDEE Calculator</Link></li>
            <li><Link to="/food-search">USDA & Verified Database</Link></li>
            <li><Link to="/ai-coach">AI Nutrition Advisor</Link></li>
            <li><Link to="/help">Nutrition FAQ</Link></li>
          </ul>
        </div>

        {/* Legal & Medical */}
        <div>
          <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
            Transparency & Policies
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/help">Contact & Support</Link></li>
          </ul>
        </div>
      </div>

      {/* Medical Disclaimer Banner */}
      <div
        style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            backgroundColor: 'var(--bg-subtle)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
          }}
        >
          <strong>Medical &amp; Nutritional Disclaimer:</strong> NutriTrack provides nutritional calculations, calorie estimations, and dietary logs for informational and self-monitoring purposes only. NutriTrack is not a medical device, diagnosis tool, or substitute for individualized medical nutrition therapy. Always consult a qualified physician or registered dietitian before beginning any significant caloric deficit, elimination diet, or training program, particularly if pregnant, nursing, under 18, or managing chronic conditions.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-light)',
          }}
        >
          <span>© {new Date().getFullYear()} NutriTrack Health Systems. All rights reserved.</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            Built with <Heart size={14} color="#f43f5e" fill="#f43f5e" /> for healthy human nutrition
          </span>
        </div>
      </div>
    </footer>
  );
};
