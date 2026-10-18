import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.ts';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
  RefreshCw,
  Utensils,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const FoodScannerPage: React.FC = () => {
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [scanning, setScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editable confirmation form
  const [dishName, setDishName] = useState('');
  const [category, setCategory] = useState('Prepared Meals');
  const [portionQuantity, setPortionQuantity] = useState(200);
  const [portionUnit, setPortionUnit] = useState('g');
  const [calories, setCalories] = useState(350);
  const [protein, setProtein] = useState(20);
  const [carbs, setCarbs] = useState(35);
  const [fat, setFat] = useState(12);
  const [targetMeal, setTargetMeal] = useState('lunch');
  const [targetDate, setTargetDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [savingToDiary, setSavingToDiary] = useState(false);
  const [successSaved, setSuccessSaved] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.');
      return;
    }

    setError(null);
    setImageMime(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      setAnalysisResult(null);
      setSuccessSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const handleStartAnalysis = async () => {
    if (!selectedImage) return;

    try {
      setScanning(true);
      setError(null);

      const res = await api.scanFoodImage(selectedImage, imageMime);
      if (res.success && res.analysis) {
        const a = res.analysis;
        setAnalysisResult(a);
        setDishName(a.dish_name || 'Logged Meal');
        setCategory(a.category || 'Prepared Meals');
        setPortionQuantity(a.serving_size || 200);
        setPortionUnit(a.serving_unit || 'g');
        setCalories(Math.round(a.calories));
        setProtein(Math.round(a.protein * 10) / 10);
        setCarbs(Math.round(a.carbs * 10) / 10);
        setFat(Math.round(a.fat * 10) / 10);
      } else {
        throw new Error(res.message || 'Analysis did not return data');
      }
    } catch (err: any) {
      console.error('[Scan error]', err);
      setError(err.message || 'Failed to analyze food photo. Please check your image.');
    } finally {
      setScanning(false);
    }
  };

  const handleConfirmAddToDiary = async () => {
    try {
      setSavingToDiary(true);
      await api.addMeal({
        date: targetDate,
        meal_type: targetMeal,
        food_name: dishName,
        portion_quantity: portionQuantity,
        portion_unit: portionUnit,
        calories,
        protein,
        carbs,
        fat,
      });

      setSuccessSaved(true);
      setTimeout(() => {
        navigate(`/food-diary?date=${targetDate}`);
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to save scanned meal.');
    } finally {
      setSavingToDiary(false);
    }
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setError(null);
    setSuccessSaved(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="content-wrapper fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <div className="badge badge-purple" style={{ marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Sparkles size={14} /> Gemini 3.8 Flash Vision
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          AI Food Photo Scanner
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem', maxWidth: '680px' }}>
          Upload or capture a photo of your meal. Our multimodal AI identifies ingredients, estimates portion density, and calculates nutritional breakdown for your confirmation.
        </p>
      </div>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--accent-rose-light)',
            color: '#9f1239',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            border: '1px solid rgba(244, 63, 94, 0.2)',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Upload & Preview Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.75rem',
          alignItems: 'start',
        }}
      >
        {/* Left: Image Upload & Preview Card */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
            1. Select or Snap Food Photo
          </h3>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {selectedImage ? (
            <div>
              <div
                style={{
                  width: '100%',
                  height: '280px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundColor: '#000000',
                  marginBottom: '1.25rem',
                }}
              >
                <img
                  src={selectedImage}
                  alt="Food plate"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleStartAnalysis}
                  disabled={scanning}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {scanning ? (
                    <>
                      <RefreshCw size={18} className="spin" />
                      <span>Analyzing with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Analyze Meal Photo</span>
                    </>
                  )}
                </button>
                <button onClick={resetScanner} className="btn btn-secondary btn-sm" disabled={scanning}>
                  Change Photo
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: 'var(--radius-lg)',
                padding: '3.5rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: 'var(--bg-main)',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary-dark)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Camera size={26} />
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                Take photo or browse image
              </h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', maxWidth: '280px', margin: '0 auto' }}>
                Supports JPEG, PNG, WebP up to 10MB. Natural lighting and clear plate views work best.
              </p>
            </div>
          )}

          {/* Scientific Disclaimer Note */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <HelpCircle size={16} color="var(--primary-dark)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Visual Accuracy Notice:</strong> AI vision provides estimates based on visual appearance. Cooking oils, butter dressings, sauces, and exact seasoning density cannot be visually seen. Always review and adjust values before logging.
            </div>
          </div>
        </div>

        {/* Right: Analysis Breakdown & Confirmation */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
            2. Review &amp; Confirm Breakdown
          </h3>

          {scanning ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: '3px solid var(--primary-light)',
                  borderTopColor: 'var(--primary)',
                  margin: '0 auto 1.25rem auto',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Scanning meal plate...
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Gemini 3.8 Flash is isolating food components and calculating nutritional metrics.
              </p>
            </div>
          ) : analysisResult ? (
            <div className="fade-in">
              {/* Confidence & Assessment */}
              <div
                style={{
                  backgroundColor: 'var(--primary-light)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary-dark)' }}>
                    AI Detection Confidence: {Math.round(analysisResult.confidence * 100)}%
                  </span>
                  <span className="badge badge-success">Analyzed</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#065f46', lineHeight: 1.5 }}>
                  {analysisResult.analysis_summary}
                </p>
              </div>

              {/* Detected Sub-components */}
              {analysisResult.detected_items && analysisResult.detected_items.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Observed Ingredients
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
                    {analysisResult.detected_items.map((it: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.825rem',
                          backgroundColor: 'var(--bg-main)',
                          padding: '0.45rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{it.item_name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {it.estimated_portion} • ~{it.calories} kcal
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Editable Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    Meal Name / Title
                  </label>
                  <input
                    type="text"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                      Log to Meal Window
                    </label>
                    <select value={targetMeal} onChange={(e) => setTargetMeal(e.target.value)}>
                      <option value="breakfast">Breakfast</option>
                      <option value="morning_snack">Morning Snack</option>
                      <option value="lunch">Lunch</option>
                      <option value="evening_snack">Evening Snack</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                      Log Date
                    </label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Calories (kcal)
                    </label>
                    <input
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(parseFloat(e.target.value) || 0)}
                      style={{ fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={protein}
                      onChange={(e) => setProtein(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={carbs}
                      onChange={(e) => setCarbs(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={fat}
                      onChange={(e) => setFat(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              {successSaved ? (
                <div
                  style={{
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary-dark)',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <CheckCircle2 size={20} />
                  <span>Meal successfully logged to your diary! Redirecting...</span>
                </div>
              ) : (
                <button
                  onClick={handleConfirmAddToDiary}
                  disabled={savingToDiary}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem' }}
                >
                  {savingToDiary ? 'Saving to Diary...' : 'Confirm & Save to Diary'}
                  <CheckCircle2 size={18} />
                </button>
              )}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1.5rem',
                color: 'var(--text-muted)',
              }}
            >
              <Utensils size={36} color="#cbd5e1" style={{ margin: '0 auto 1rem auto' }} />
              <p style={{ fontSize: '0.9rem' }}>
                Upload or take a photo on the left, then click <strong>"Analyze Meal Photo"</strong> to review calorie and macro estimates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
