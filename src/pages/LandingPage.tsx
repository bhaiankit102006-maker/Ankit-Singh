import React from 'react';
import { Link } from 'react-router-dom';
import {
  Apple,
  Camera,
  TrendingUp,
  Droplets,
  CalendarDays,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  PieChart,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, #ecfdf5 0%, #ffffff 100%)',
          padding: '4.5rem 1.5rem 4rem 1.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-color)',
              padding: '0.35rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.825rem',
              fontWeight: 600,
              color: 'var(--primary-dark)',
              marginBottom: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Sparkles size={16} color="var(--primary)" />
            <span>AI-Powered Food Scanner &amp; Scientific Macro Tracking</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 850,
              lineHeight: 1.15,
              color: '#0f172a',
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem',
            }}
          >
            Your Health. Your Nutrition. <br />
            <span style={{ color: 'var(--primary)' }}>Your Progress.</span>
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 auto 2.25rem auto',
            }}
          >
            Take the guesswork out of nutrition. NutriTrack combines verified clinical energy equations,
            real relational meal diaries, and cutting-edge visual AI food recognition to empower your daily wellness.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '1rem',
              marginBottom: '3rem',
            }}
          >
            <Link to="/signup" className="btn btn-primary btn-lg">
              <span>Start Free Tracking</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              <span>Sign In to Your Diary</span>
            </Link>
          </div>

          {/* Quick Trust Highlights */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '1.75rem',
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={16} color="var(--primary)" /> No Crash Diets
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={16} color="var(--primary)" /> Mifflin-St Jeor Energy Science
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={16} color="var(--primary)" /> Zero Ads or Hidden Subscriptions
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Feature Grid */}
      <section style={{ padding: '4rem 1.5rem', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              Everything You Need For Sustainable Nutrition
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
              Built with precision database persistence, real calculated macronutrients, and practical everyday tools.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {/* Feature 1 */}
            <div className="card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Apple size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
                Accurate Food Diary &amp; Macros
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Log breakfast, lunch, dinner, and snacks with proportional serving recalculation. Track calories, protein, carbs, healthy fats, fiber, sugar, and sodium.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card" style={{ padding: '2rem', border: '1.5px solid rgba(16, 185, 129, 0.3)' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-purple-light)',
                  color: 'var(--accent-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Camera size={24} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                  AI Food Photo Scanner
                </h3>
                <span className="badge badge-purple">Gemini Vision</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Snap or upload any plate of food. Our integrated vision model analyzes ingredients, suggests realistic portion estimates, and allows quick manual confirmation before saving to your diary.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--secondary-light)',
                  color: 'var(--secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Droplets size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
                Hydration &amp; Water Logger
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Keep track of your daily hydration with 150ml, 250ml, and 500ml quick-add shortcuts, custom amounts, and automatic water goals calculated from your body mass.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-orange-light)',
                  color: 'var(--accent-orange)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <CalendarDays size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
                Personalized Meal Planner
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Design custom meal plans matching your dietary preferences (vegan, vegetarian, eggetarian, or omnivore). Copy meals between days and add entire planned days directly into your diary with one tap.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <TrendingUp size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
                Weight &amp; Trend Analytics
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Visualize 7-day, 30-day, and 90-day progress trends. Track weekly moving averages that filter out normal daily water weight fluctuations.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-purple-light)',
                  color: 'var(--accent-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Sparkles size={24} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                  AI Nutrition Advisor
                </h3>
                <span className="badge badge-purple">Interactive</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Ask questions tailored to your remaining macros. "I have 400 calories and 30g protein left for dinner, what should I eat?" gets smart suggestions grounded in your dietary preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '4rem 1.5rem', backgroundColor: 'var(--bg-main)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            How NutriTrack Works
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '3rem' }}>
            A structured, 3-step pathway to permanent dietary awareness.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '2rem',
              textAlign: 'left',
            }}
          >
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                01
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem', color: '#0f172a' }}>
                Personal Health Setup
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Enter your height, weight, activity level, and dietary preference. We compute your BMR and baseline maintenance calories using verified formulas.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                02
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem', color: '#0f172a' }}>
                Frictionless Logging
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Search our food database or take a photo of your meal. Log entries in seconds with customized portion sizes and instant macro calculations.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                03
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem', color: '#0f172a' }}>
                Progress &amp; Consistency
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Watch your 7-day intake charts and weight moving averages. Adjust your calorie targets anytime as your metabolism and body composition evolve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: '4.5rem 1.5rem',
          backgroundColor: '#064e3b',
          color: '#ffffff',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 850, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            Ready to Take Control of Your Nutrition?
          </h2>
          <p style={{ fontSize: '1.05rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '2rem' }}>
            Join NutriTrack today. Track calories, log meals, record water intake, and build lasting, healthy nutrition habits.
          </p>
          <Link
            to="/signup"
            className="btn btn-lg"
            style={{
              backgroundColor: '#ffffff',
              color: '#064e3b',
              fontWeight: 700,
            }}
          >
            Create Your Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};
