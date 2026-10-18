import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { calculateMifflinStJeor } from '../utils/nutritionCalculations.ts';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Info,
  Scale,
  Flame,
  Activity,
  Heart,
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { profile, updateProfileState } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [gender, setGender] = useState('prefer_not_to_say');
  const [age, setAge] = useState(28);
  const [heightCm, setHeightCm] = useState(172);
  const [weightKg, setWeightKg] = useState(70);
  const [targetWeightKg, setTargetWeightKg] = useState(68);
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [goal, setGoal] = useState('maintain_weight');
  const [dietaryPreference, setDietaryPreference] = useState('omnivore');
  const [allergies, setAllergies] = useState('');
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [healthNotes, setHealthNotes] = useState('');

  // Editable calculated targets
  const [customCalories, setCustomCalories] = useState<number>(2000);
  const [customProtein, setCustomProtein] = useState<number>(130);
  const [customCarbs, setCustomCarbs] = useState<number>(220);
  const [customFat, setCustomFat] = useState<number>(65);
  const [customWater, setCustomWater] = useState<number>(2500);

  // Pre-fill from existing profile if available
  useEffect(() => {
    if (profile) {
      if (profile.gender) setGender(profile.gender);
      if (profile.age) setAge(profile.age);
      if (profile.height_cm) setHeightCm(Number(profile.height_cm));
      if (profile.current_weight_kg) setWeightKg(Number(profile.current_weight_kg));
      if (profile.target_weight_kg) setTargetWeightKg(Number(profile.target_weight_kg));
      if (profile.activity_level) setActivityLevel(profile.activity_level);
      if (profile.goal) setGoal(profile.goal);
      if (profile.dietary_preference) setDietaryPreference(profile.dietary_preference);
      if (profile.allergies) setAllergies(profile.allergies);
      if (profile.meals_per_day) setMealsPerDay(profile.meals_per_day);
      if (profile.health_notes) setHealthNotes(profile.health_notes);
    }
  }, [profile]);

  // Recalculate science-based baseline
  const calculated = calculateMifflinStJeor({
    gender,
    age,
    height_cm: heightCm,
    current_weight_kg: weightKg,
    target_weight_kg: targetWeightKg,
    activity_level: activityLevel,
    goal,
    dietary_preference: dietaryPreference,
  });

  // Keep target fields in sync when inputs change
  useEffect(() => {
    setCustomCalories(calculated.daily_calorie_target);
    setCustomProtein(calculated.protein_target_g);
    setCustomCarbs(calculated.carbs_target_g);
    setCustomFat(calculated.fat_target_g);
    setCustomWater(calculated.water_target_ml);
  }, [gender, age, heightCm, weightKg, activityLevel, goal, dietaryPreference]);

  const handleComplete = async () => {
    try {
      setLoading(true);
      const res = await api.updateProfile({
        gender,
        age: Number(age),
        height_cm: Number(heightCm),
        current_weight_kg: Number(weightKg),
        target_weight_kg: targetWeightKg ? Number(targetWeightKg) : null,
        activity_level: activityLevel,
        goal,
        dietary_preference: dietaryPreference,
        allergies: allergies.trim() || null,
        meals_per_day: Number(mealsPerDay),
        bmr: calculated.bmr,
        tdee: calculated.tdee,
        daily_calorie_target: Number(customCalories),
        protein_target_g: Number(customProtein),
        carbs_target_g: Number(customCarbs),
        fat_target_g: Number(customFat),
        water_target_ml: Number(customWater),
        health_notes: healthNotes.trim() || null,
      });

      if (res.success && res.profile) {
        updateProfileState(res.profile);
        // Also log initial starting weight in weight table
        await api.addWeight(Number(weightKg), new Date().toISOString().split('T')[0], 'Initial onboarding weight entry');
      }
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to save health profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto 5rem auto', padding: '0 1.5rem' }}>
      {/* Stepper Progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        {[1, 2, 3].map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: s < 3 ? 1 : 'none' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: step >= s ? 'var(--primary)' : 'var(--border-color)',
                color: step >= s ? '#ffffff' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
              }}
            >
              {step > s ? <CheckCircle2 size={20} /> : s}
            </div>
            {s < 3 && (
              <div
                style={{
                  flex: 1,
                  height: '3px',
                  backgroundColor: step > s ? 'var(--primary)' : 'var(--border-color)',
                  margin: '0 0.75rem',
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="card fade-in" style={{ padding: '2.5rem 2rem' }}>
        {/* STEP 1: Biometrics & Activity */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '1.75rem' }}>
              <div className="badge badge-success" style={{ marginBottom: '0.5rem' }}>
                Step 1 of 3
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                Your Biometrics &amp; Activity
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                We use these numbers with the Mifflin–St Jeor formula to determine your baseline metabolic rate.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Biological Sex (Formula Calibration)
                </label>
                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="male">Male (+5 kcal factor)</option>
                  <option value="female">Female (-161 kcal factor)</option>
                  <option value="prefer_not_to_say">Prefer not to say (Neutral median)</option>
                </select>
                <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Required solely for metabolic calculation precision.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Age (years)
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
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="100"
                  max="250"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseInt(e.target.value) || 170)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="30"
                  max="300"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 70)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Target Weight (kg, optional)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="30"
                  max="300"
                  value={targetWeightKg || ''}
                  placeholder="Optional target"
                  onChange={(e) => setTargetWeightKg(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Physical Activity Level
                </label>
                <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}>
                  <option value="sedentary">Sedentary (Desk work, little exercise)</option>
                  <option value="light">Lightly Active (1-3 workout days/wk)</option>
                  <option value="moderate">Moderately Active (3-5 workout days/wk)</option>
                  <option value="active">Very Active (6-7 intense workout days/wk)</option>
                  <option value="very_active">Extremely Active (Athletic labor / 2x daily)</option>
                </select>
              </div>
            </div>

            {/* Real-time calculated BMI indicator */}
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.75rem',
              }}
            >
              <Scale size={24} color="var(--primary)" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Current Body Mass Index (BMI):
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>{calculated.bmi}</span>
                  <span className="badge badge-info">{calculated.bmi_category}</span>
                </div>
              </div>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', maxWidth: '280px' }}>
                Note: BMI is a screening ratio and does not distinguish between muscle mass and fat tissue.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setStep(2)} className="btn btn-primary">
                <span>Continue to Goals</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Goals & Dietary Preferences */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: '1.75rem' }}>
              <div className="badge badge-success" style={{ marginBottom: '0.5rem' }}>
                Step 2 of 3
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                Health Goals &amp; Diet Style
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Customize your dietary restrictions, preferred eating style, and primary wellness target.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Primary Nutrition Goal
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { id: 'lose_weight', label: 'Weight Loss', desc: 'Safe 400 kcal deficit' },
                    { id: 'maintain_weight', label: 'Maintain & Tone', desc: 'Exact TDEE balance' },
                    { id: 'gain_weight', label: 'Muscle Gain', desc: 'Controlled +350 kcal surplus' },
                  ].map((g) => (
                    <div
                      key={g.id}
                      onClick={() => setGoal(g.id)}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: goal === g.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        backgroundColor: goal === g.id ? 'var(--primary-light)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{g.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{g.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Dietary Lifestyle
                  </label>
                  <select value={dietaryPreference} onChange={(e) => setDietaryPreference(e.target.value)}>
                    <option value="omnivore">Omnivore (All foods)</option>
                    <option value="vegetarian">Vegetarian (Dairy &amp; plants)</option>
                    <option value="eggetarian">Eggetarian (Eggs, dairy, &amp; plants)</option>
                    <option value="vegan">Vegan (100% plant-based)</option>
                    <option value="pescatarian">Pescatarian (Fish &amp; plant foods)</option>
                    <option value="keto">Ketogenic (Low carb, high healthy fat)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Meals per Day
                  </label>
                  <select value={mealsPerDay} onChange={(e) => setMealsPerDay(parseInt(e.target.value) || 3)}>
                    <option value={2}>2 Meals (Intermittent Fasting)</option>
                    <option value={3}>3 Main Meals (Standard)</option>
                    <option value={4}>3 Meals + 1 Snack</option>
                    <option value={5}>3 Meals + 2 Snacks</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Allergies &amp; Food Restrictions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Peanuts, Gluten, Dairy lactose, Shellfish"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                />
                <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Our AI meal planner and advisor will strictly respect these filters.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Optional Health Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Any digestive sensitivities, athletic training goals, or notes for your coach..."
                  value={healthNotes}
                  onChange={(e) => setHealthNotes(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(1)} className="btn btn-secondary">
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
              <button onClick={() => setStep(3)} className="btn btn-primary">
                <span>Review Targets</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Science Calculation Review & Editable Overrides */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: '1.75rem' }}>
              <div className="badge badge-success" style={{ marginBottom: '0.5rem' }}>
                Step 3 of 3
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                Review Your Calculated Targets
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Here are your energy and macronutrient recommendations derived from the Mifflin–St Jeor formula. You can fine-tune any target below.
              </p>
            </div>

            {/* Science Equation Explanation Box */}
            <div
              style={{
                backgroundColor: 'var(--primary-light)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginBottom: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Flame size={20} color="var(--primary-dark)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-dark)' }}>
                  Energy Science Summary
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.85rem', color: '#064e3b' }}>
                <div>
                  <strong>BMR (Basal Rate):</strong> {calculated.bmr} kcal/day
                </div>
                <div>
                  <strong>TDEE (Total Burn):</strong> {calculated.tdee} kcal/day
                </div>
                <div>
                  <strong>Hydration Base:</strong> {calculated.water_target_ml} ml/day
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#047857', marginTop: '0.65rem', lineHeight: 1.5 }}>
                Estimated with Mifflin-St Jeor equation. Goal adjustment applied: {goal === 'lose_weight' ? '-400 kcal (safe deficit)' : goal === 'gain_weight' ? '+350 kcal (lean surplus)' : '0 kcal (maintenance)'}.
              </p>
            </div>

            {/* Editable Macro Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div className="card" style={{ padding: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Daily Calories (kcal)
                </label>
                <input
                  type="number"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(parseInt(e.target.value) || 2000)}
                  style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-dark)' }}
                />
              </div>

              <div className="card" style={{ padding: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Protein (g)
                </label>
                <input
                  type="number"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(parseInt(e.target.value) || 120)}
                  style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}
                />
              </div>

              <div className="card" style={{ padding: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Carbohydrates (g)
                </label>
                <input
                  type="number"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(parseInt(e.target.value) || 220)}
                  style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}
                />
              </div>

              <div className="card" style={{ padding: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Dietary Fat (g)
                </label>
                <input
                  type="number"
                  value={customFat}
                  onChange={(e) => setCustomFat(parseInt(e.target.value) || 65)}
                  style={{ fontSize: '1.25rem', fontWeight: 800, color: '#9333ea' }}
                />
              </div>

              <div className="card" style={{ padding: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Water Target (ml)
                </label>
                <input
                  type="number"
                  step="100"
                  value={customWater}
                  onChange={(e) => setCustomWater(parseInt(e.target.value) || 2500)}
                  style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0ea5e9' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(2)} className="btn btn-secondary">
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="btn btn-primary btn-lg"
              >
                {loading ? 'Saving Profile...' : 'Save & Launch NutriTrack'}
                <CheckCircle2 size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
