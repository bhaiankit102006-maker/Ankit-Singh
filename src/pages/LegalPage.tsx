import React, { useState } from 'react';

export const LegalPage: React.FC<{ defaultTab?: 'privacy' | 'terms' }> = ({ defaultTab = 'privacy' }) => {
  const [tab, setTab] = useState<'privacy' | 'terms'>(defaultTab);

  return (
    <div className="content-wrapper fade-in" style={{ maxWidth: '860px' }}>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setTab('privacy')}
          className={`btn ${tab === 'privacy' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Privacy Policy
        </button>
        <button
          onClick={() => setTab('terms')}
          className={`btn ${tab === 'terms' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Terms &amp; Conditions
        </button>
      </div>

      <div className="card" style={{ padding: '2.5rem 2rem', lineHeight: 1.7, fontSize: '0.925rem', color: '#334155' }}>
        {tab === 'privacy' ? (
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
              NutriTrack Privacy Policy
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              Last revised: October 2026
            </p>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
              1. Information We Collect
            </h3>
            <p>
              NutriTrack collects your name, email address, password hash, biometric parameters (height, weight, biological sex for energy equation calibration, age), and food diary logs for the sole purpose of computing your personalized nutrition targets and tracking your progress.
            </p>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
              2. How Food Images Are Handled
            </h3>
            <p>
              When using the AI Food Scanner, meal photos are processed securely by Google's Gemini Vision API on the server side to detect ingredient candidates. We do not sell or monetize your food images, and images are not stored permanently after analysis unless you choose to save the logged meal.
            </p>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
              3. Data Ownership &amp; Permanent Deletion
            </h3>
            <p>
              You own your health records. You may export or permanently delete your account and all associated food, water, weight, and biometric records at any time via Settings &gt; Danger Zone. Deletion removes all records from our database without hidden retention.
            </p>
          </div>
        ) : (
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
              NutriTrack Terms &amp; Conditions
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              Last revised: October 2026
            </p>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
              1. Non-Medical Disclaimer
            </h3>
            <p>
              NutriTrack provides nutritional calculations, calorie estimations, and meal logs for informational, fitness, and lifestyle self-monitoring only. NutriTrack is not a medical provider and does not provide clinical diagnoses, medical nutrition therapy, or prescription diets. If you are pregnant, nursing, a minor, or have any medical conditions or eating disorder history, consult a physician or registered dietitian before adopting a caloric deficit.
            </p>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
              2. Acceptable Use
            </h3>
            <p>
              You agree to provide accurate information and to maintain the confidentiality of your login credentials. Automated scraping or denial-of-service abuse of our food database and AI scanning endpoints is prohibited.
            </p>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
              3. Estimation Accuracy
            </h3>
            <p>
              Nutrition databases and AI vision recognition are inherently estimates. Serving densities, cooking methods, hidden oils, and brand formulations vary widely. You are solely responsible for reviewing and confirming your logged portions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
