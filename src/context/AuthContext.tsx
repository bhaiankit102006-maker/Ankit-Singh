import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getStoredToken, getStoredUser, setStoredAuth, clearStoredAuth } from '../services/api.ts';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_verified: number;
}

export interface UserProfile {
  id: number;
  user_id: number;
  age: number | null;
  date_of_birth: string | null;
  gender: string;
  height_cm: number | null;
  current_weight_kg: number | null;
  target_weight_kg: number | null;
  activity_level: string;
  goal: string;
  dietary_preference: string;
  allergies: string | null;
  meals_per_day: number;
  bmr: number | null;
  tdee: number | null;
  daily_calorie_target: number;
  protein_target_g: number;
  carbs_target_g: number;
  fat_target_g: number;
  water_target_ml: number;
  health_notes: string | null;
}

export interface UserSettings {
  id: number;
  user_id: number;
  unit_system: 'metric' | 'imperial';
  daily_water_target_ml: number;
  notifications_enabled: number;
  privacy_analytics: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  settings: UserSettings | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfileState: (prof: UserProfile) => void;
  updateSettingsState: (sett: UserSettings) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setProfile(null);
      setSettings(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      if (data.success) {
        setUser(data.user);
        setProfile(data.profile);
        setSettings(data.settings);
        setStoredAuth(currentToken, data.user);
      } else {
        clearStoredAuth();
        setUser(null);
        setProfile(null);
        setSettings(null);
      }
    } catch (err) {
      console.warn('[AuthContext] Session expired or server error:', err);
      clearStoredAuth();
      setUser(null);
      setProfile(null);
      setSettings(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await api.login({ email, password: pass });
    if (data.success && data.token) {
      setStoredAuth(data.token, data.user);
      setToken(data.token);
      setUser(data.user);
      setProfile(data.profile);
      await refreshUser();
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    const data = await api.signup({ name, email, password: pass });
    if (data.success && data.token) {
      setStoredAuth(data.token, data.user);
      setToken(data.token);
      setUser(data.user);
      setProfile(data.profile);
      await refreshUser();
    }
  };

  const logout = () => {
    try {
      api.logout().catch(() => {});
    } finally {
      clearStoredAuth();
      setToken(null);
      setUser(null);
      setProfile(null);
      setSettings(null);
    }
  };

  const updateProfileState = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };

  const updateSettingsState = (newSettings: UserSettings) => {
    setSettings(newSettings);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        settings,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
        updateProfileState,
        updateSettingsState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
