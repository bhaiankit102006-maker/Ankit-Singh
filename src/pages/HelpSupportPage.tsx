import React, { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, ShieldCheck, Heart, Send, CheckCircle2 } from 'lucide-react';

export const HelpSupportPage: React.FC = () => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !message) return;
    setSent(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setMessage('');
      setSent(false);
    }, 4000);
  };

  const faqs = [
    {
      q: 'How does NutriTrack calculate my daily calorie target?',
      a: 'We use the peer-reviewed Mifflin–St Jeor formula, widely recognized in clinical nutrition for estimating Basal Metabolic Rate (BMR) from biological sex, weight, height, and age. Total Daily Energy Expenditure (TDEE) is then calculated using activity multipliers, and a conservative, sustainable deficit (-400 kcal) or surplus (+350 kcal) is applied depending on your selected goal.',
    },
    {
      q: 'Can the AI Food Photo Scanner determine exact calories?',
      a: 'No visual model can measure invisible ingredients such as cooking oils, hidden butter, sodium concentration, or deep-dish ingredient density. Our Gemini 3.8 Flash Vision integration provides educated estimations and transparent confidence scores, giving you a fast starting point that you can always manually calibrate before saving.',
    },
    {
      q: 'Why do my daily weights fluctuate by 1-2 kg?',
      a: 'Short-term scale fluctuations are almost always due to hydration, sodium intake, and glycogen water storage (every gram of stored glycogen holds roughly 3 grams of water). NutriTrack emphasizes 7-day and 30-day moving averages rather than single-day spikes.',
    },
    {
      q: 'Is NutriTrack suitable for medical nutrition therapy?',
      a: 'NutriTrack is an educational and self-monitoring application. It does not diagnose, treat, or prevent clinical conditions (such as diabetes, renal disease, eating disorders, or pregnancy-related dietary management). Please consult a registered dietitian or licensed medical practitioner for personalized clinical guidance.',
    },
  ];

  return (
    <div className="content-wrapper fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Help &amp; Nutritional Support
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Frequently asked questions, energy balance science, and technical support.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* FAQ List */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((f, idx) => (
              <div key={idx} className="card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.975rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
                  {f.q}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
            Contact Support &amp; Feedback
          </h2>
          <div className="card" style={{ padding: '1.75rem' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle2 size={36} color="var(--primary)" style={{ margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Message Received!
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Our nutrition and technical team will review your inquiry and follow up shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="Jordan Lee"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="jordan@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Message / Bug Report / Feedback
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your inquiry or nutrition question..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem' }}
                >
                  <Send size={16} />
                  <span>Send Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
