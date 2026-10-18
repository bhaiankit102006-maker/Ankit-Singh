import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { calculateMifflinStJeor } from '../utils/nutritionCalculations.ts';
import {
  User,
  CheckCircle2,
  AlertCircle,
  Flame,
  Scale,
  Activity,
  Heart,
  Save,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, profile, updateProfileState } = useAuth();

  const [gender, setGender] = useState('prefer_not_to_say');
  const [age, setAge] = useState(28);
  const [heightCm, setHeightCm] = useState(172);
  const [currentWeightKg, setCurrentWeightKg] = useState(70);
  const [targetWeightKg, setTargetWeightKg] = useState(68);
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [goal, setGoal] = useState('maintain_weight');
  const [dietaryPreference, setDietaryPreference] = useState('omnivore');
  const [allergies, setAllergies] = useState('');
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [healthNotes, setHealthNotes] = useState('');

  // Targets
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [proteinTarget, setProteinTarget] = useState(120);
  const [carbsTarget, setCarbsTarget] = useState(220);
  const [fatTarget, setFatTarget] = useState(65);
  const [waterTarget, setWaterTarget] = useState(2500);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      if (profile.gender) setGender(profile.gender);
      if (profile.age) setAge(profile.age);
      if (profile.height_cm) setHeightCm(Number(profile.height_cm));
      if (profile.current_weight_kg) setCurrentWeightKg(Number(profile.current_weight_kg));
      if (profile.target_weight_kg) setTargetWeightKg(Number(profile.target_weight_kg));
      if (profile.activity_level) setActivityLevel(profile.activity_level);
      if (profile.goal) setGoal(profile.goal);
      if (profile.dietary_preference) setDietaryPreference(profile.dietary_preference);
      if (profile.allergies) setAllergies(profile.allergies);
      if (profile.meals_per_day) setMealsPerDay(profile.meals_per_day);
      if (profile.health_notes) setHealthNotes(profile.health_notes);

      if (profile.daily_calorie_target) setCalorieTarget(profile.daily_calorie_target);
      if (profile.protein_target_g) setProteinTarget(Number(profile.protein_target_g));
      if (profile.carbs_target_g) setCarbsTarget(Number(profile.carbs_target_g));
      if (profile.fat_target_g) setFatTarget(Number(profile.fat_target_g));
      if (profile.water_target_ml) setWaterTarget(profile.water_target_ml);
    }
  }, [profile]);

  const handleRecalculate = () => {
    const calc = calculateMifflinStJeor({
      gender,
      age,
      height_cm: heightCm,
      current_weight_kg: currentWeightKg,
      target_weight_kg: targetWeightKg,
      activity_level: activityLevel,
      goal,
      dietary_preference: dietaryPreference,
    });
    setCalorieTarget(calc.daily_calorie_target);
    setProteinTarget(calc.protein_target_g);
    setCarbsTarget(calc.carbs_target_g);
    setFatTarget(calc.fat_target_g);
    setWaterTarget(calc.water_target_ml);
    alert('Targets reset to fresh Mifflin–St Jeor recommendations!');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const calc = calculateMifflinStJeor({
        gender,
        age,
        height_cm: heightCm,
        current_weight_kg: currentWeightKg,
        target_weight_kg: targetWeightKg,
        activity_level: activityLevel,
        goal,
        dietary_preference: dietaryPreference,
      });

      const res = await api.updateProfile({
        gender,
        age: Number(age),
        height_cm: Number(heightCm),
        current_weight_kg: Number(currentWeightKg),
        target_weight_kg: targetWeightKg ? Number(targetWeightKg) : null,
        activity_level: activityLevel,
        goal,
        dietary_preference: dietaryPreference,
        allergies: allergies.trim() || null,
        meals_per_day: Number(mealsPerDay),
        bmr: calc.bmr,
        tdee: calc.tdee,
        daily_calorie_target: Number(calorieTarget),
        protein_target_g: Number(proteinTarget),
        carbs_target_g: Number(carbsTarget),
        fat_target_g: Number(fatTarget),
        water_target_ml: Number(waterTarget),
        health_notes: healthNotes.trim() || null,
      });

      if (res.success && res.profile) {
        updateProfileState(res.profile);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content-wrapper fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Personal Health Profile
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Update your biometrics, activity, dietary restrictions, and energy targets.
        </p>
      </div>

      {success && (
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
          <span>Profile changes successfully saved to database!</span>
        </div>
      )}

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--accent-rose-light)',
            color: '#9f1239',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Account Info Box */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
            Account Credentials
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Full Name
              </label>
              <input type="text" value={user?.name || ''} disabled style={{ backgroundColor: 'var(--bg-subtle)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Email Address
              </label>
              <input type="email" value={user?.email || ''} disabled style={{ backgroundColor: 'var(--bg-subtle)' }} />
            </div>
          </div>
        </div>

        {/* Biometrics */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
            Biometrics &amp; Metabolic Factors
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Sex (Mifflin-St Jeor calibration)
              </label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Age
              </label>
              <input
                type="number"
                min="16"
                max="105"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 25)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Height (cm)
              </label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(parseInt(e.target.value) || 170)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Current Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={currentWeightKg}
                onChange={(e) => setCurrentWeightKg(parseFloat(e.target.value) || 70)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Target Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={targetWeightKg || ''}
                onChange={(e) => setTargetWeightKg(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Physical Activity Level
              </label>
              <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}>
                <option value="sedentary">Sedentary (Desk work)</option>
                <option value="light">Lightly Active (1-3 d/wk)</option>
                <option value="moderate">Moderately Active (3-5 d/wk)</option>
                <option value="active">Very Active (6-7 d/wk)</option>
                <option value="very_active">Extremely Active</option>
              </select>
            </div>
          </div>
        </div>

        {/* Goals & Preferences */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
            Dietary Style &amp; Restrictions
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Weight Goal
              </label>
              <select value={goal} onChange={(e) => setGoal(e.target.value)}>
                <option value="lose_weight">Weight Loss (-400 kcal)</option>
                <option value="maintain_weight">Maintain Weight (TDEE)</option>
                <option value="gain_weight">Weight/Muscle Gain (+350 kcal)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Dietary Preference
              </label>
              <select value={dietaryPreference} onChange={(e) => setDietaryPreference(e.target.value)}>
                <option value="omnivore">Omnivore</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="eggetarian">Eggetarian</option>
                <option value="vegan">Vegan</option>
                <option value="pescatarian">Pescatarian</option>
                <option value="keto">Keto</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Meals per Day
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={mealsPerDay}
                onChange={(e) => setMealsPerDay(parseInt(e.target.value) || 3)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
              Allergies and Food Intolerances
            </label>
            <input
              type="text"
              placeholder="e.g. Peanuts, Dairy, Gluten, Soy"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
            />
          </div>
        </div>

        {/* Daily Nutrition Targets */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              Custom Daily Energy Targets
            </h3>
            <button
              type="button"
              onClick={handleRecalculate}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem' }}
            >
              Reset to Mifflin-St Jeor Formula
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Daily Calories (kcal)
              </label>
              <input
                type="number"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(parseInt(e.target.value) || 2000)}
                style={{ fontWeight: 700, color: 'var(--primary-dark)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Protein Target (g)
              </label>
              <input
                type="number"
                value={proteinTarget}
                onChange={(e) => setProteinTarget(parseInt(e.target.value) || 120)}
                style={{ fontWeight: 700, color: '#0284c7' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Carbs Target (g)
              </label>
              <input
                type="number"
                value={carbsTarget}
                onChange={(e) => setCarbsTarget(parseInt(e.target.value) || 220)}
                style={{ fontWeight: 700, color: '#d97706' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Fat Target (g)
              </label>
              <input
                type="number"
                value={fatTarget}
                onChange={(e) => setFatTarget(parseInt(e.target.value) || 65)}
                style={{ fontWeight: 700, color: '#9333ea' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Water Goal (ml)
              </label>
              <input
                type="number"
                step="100"
                value={waterTarget}
                onChange={(e) => setWaterTarget(parseInt(e.target.value) || 2500)}
                style={{ fontWeight: 700, color: '#0ea5e9' }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-lg"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Save size={18} />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
