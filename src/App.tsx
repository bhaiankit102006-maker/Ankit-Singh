import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ProtectedRoute } from './routes/ProtectedRoute.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { MobileNav } from './components/layout/MobileNav.tsx';
import { Footer } from './components/layout/Footer.tsx';

import { LandingPage } from './pages/LandingPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { SignupPage } from './pages/SignupPage.tsx';
import { OnboardingPage } from './pages/OnboardingPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { FoodDiaryPage } from './pages/FoodDiaryPage.tsx';
import { FoodSearchPage } from './pages/FoodSearchPage.tsx';
import { FoodScannerPage } from './pages/FoodScannerPage.tsx';
import { AINutritionCoachPage } from './pages/AINutritionCoachPage.tsx';
import { MealPlannerPage } from './pages/MealPlannerPage.tsx';
import { WaterTrackerPage } from './pages/WaterTrackerPage.tsx';
import { ProgressPage } from './pages/ProgressPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { HelpSupportPage } from './pages/HelpSupportPage.tsx';
import { LegalPage } from './pages/LegalPage.tsx';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Hide sidebar on landing, login, signup, onboarding
  const isPublicPage = ['/', '/login', '/signup', '/onboarding', '/privacy', '/terms', '/help'].includes(location.pathname);
  const showSidebar = isAuthenticated && !isPublicPage;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        {showSidebar && (
          <div className="desktop-sidebar">
            <Sidebar />
          </div>
        )}
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
      {showSidebar && (
        <div className="mobile-only">
          <MobileNav />
        </div>
      )}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/help" element={<HelpSupportPage />} />
            <Route path="/privacy" element={<LegalPage defaultTab="privacy" />} />
            <Route path="/terms" element={<LegalPage defaultTab="terms" />} />

            {/* Authenticated */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/food-diary"
              element={
                <ProtectedRoute>
                  <FoodDiaryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/food-search"
              element={
                <ProtectedRoute>
                  <FoodSearchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/food-scanner"
              element={
                <ProtectedRoute>
                  <FoodScannerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-coach"
              element={
                <ProtectedRoute>
                  <AINutritionCoachPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meal-planner"
              element={
                <ProtectedRoute>
                  <MealPlannerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/water-tracker"
              element={
                <ProtectedRoute>
                  <WaterTrackerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <ProgressPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}
