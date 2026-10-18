import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import {
  Settings as SettingsIcon,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Shield,
  Bell,
  Sliders,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettingsState, logout } = useAuth();
  const navigate = useNavigate();

  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [dailyWater, setDailyWater] = useState(2500);
  const [notifications, setNotifications] = useState(true);
  const [analytics, setAnalytics] = useState(true);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Deletion modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setUnitSystem(settings.unit_system || 'metric');
      setDailyWater(settings.daily_water_target_ml || 2500);
      setNotifications(settings.notifications_enabled === 1);
      setAnalytics(settings.privacy_analytics === 1);
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.updateSettings({
        unit_system: unitSystem,
        daily_water_target_ml: Number(dailyWater),
        notifications_enabled: notifications ? 1 : 0,
        privacy_analytics: analytics ? 1 : 0,
      });

      if (res.success && res.settings) {
        updateSettingsState(res.settings);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError("Please type 'DELETE' in all caps to confirm.");
      return;
    }

    try {
      setDeleting(true);
      setDeleteError(null);
      await api.deleteAccount('DELETE');
      logout();
      navigate('/');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="content-wrapper fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Application Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Configure measurement units, hydration parameters, notifications, and account privacy.
        </p>
      </div>

      {savedSuccess && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary-dark)',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Unit Preferences */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Sliders size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              Measurement Units
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Unit System
              </label>
              <select
                value={unitSystem}
                onChange={(e) => setUnitSystem(e.target.value as 'metric' | 'imperial')}
              >
                <option value="metric">Metric (Kilograms, Centimeters, Milliliters)</option>
                <option value="imperial">Imperial (Pounds, Feet &amp; Inches, Fluid Ounces)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Default Daily Water Goal (ml)
              </label>
              <input
                type="number"
                step="100"
                value={dailyWater}
                onChange={(e) => setDailyWater(parseInt(e.target.value) || 2500)}
              />
            </div>
          </div>
        </div>

        {/* Notifications & Privacy */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Shield size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              Notifications &amp; Data Control
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                  Enable In-App Meal Reminders
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Receive visual prompts to log water and meals throughout your active daily window.
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                  Anonymous Dietary Statistics
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Allow aggregated, anonymized nutritional trend analysis to improve food database accuracy.
                </div>
              </div>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Danger Zone: Account Deletion */}
      <div
        className="card"
        style={{
          padding: '1.75rem',
          marginTop: '3rem',
          border: '1.5px solid #fecdd3',
          backgroundColor: '#fff1f2',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <AlertTriangle size={22} color="#e11d48" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#9f1239' }}>
            Danger Zone
          </h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#881337', marginBottom: '1.25rem' }}>
          Permanently delete your account and all associated food diary entries, water tracking logs, weight measurements, and personal health targets. This action is irreversible.
        </p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="btn btn-danger btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Trash2 size={16} />
          <span>Delete Account Permanently</span>
        </button>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 100,
          }}
        >
          <div className="card fade-in" style={{ maxWidth: '460px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#9f1239', marginBottom: '0.5rem' }}>
              Confirm Irreversible Deletion
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              All your records in the database will be wiped immediately. To confirm, please type{' '}
              <strong style={{ color: '#0f172a' }}>DELETE</strong> below:
            </p>

            {deleteError && (
              <div
                style={{
                  backgroundColor: 'var(--accent-rose-light)',
                  color: '#9f1239',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                }}
              >
                {deleteError}
              </div>
            )}

            <input
              type="text"
              placeholder="Type DELETE"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              style={{ marginBottom: '1.5rem' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                  setDeleteError(null);
                }}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText !== 'DELETE'}
                className="btn btn-danger btn-sm"
              >
                {deleting ? 'Deleting...' : 'Confirm Account Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
