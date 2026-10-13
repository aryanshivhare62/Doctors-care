import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check current session on initial render
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authService.getMe();
      if (res && res.data && res.data.user) {
        setUser(res.data.user);
        setDoctorProfile(res.data.doctorProfile || null);
      } else {
        setUser(null);
        setDoctorProfile(null);
      }
    } catch {
      // Unauthenticated or expired cookie
      setUser(null);
      setDoctorProfile(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authService.login({ email, password });
      if (res.token) {
        localStorage.setItem('token', res.token);
      }
      setUser(res.data.user);
      // Refresh to fetch doctor profile if doctor
      if (res.data.user.role === 'doctor') {
        const meRes = await authService.getMe();
        setDoctorProfile(meRes.data.doctorProfile || null);
      }
      return res;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  // Register handler
  const register = async (userData) => {
    setError(null);
    try {
      const res = await authService.register(userData);
      if (res.token) {
        localStorage.setItem('token', res.token);
      }
      setUser(res.data.user);
      return res;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Continue client cleanup even if network fails
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setDoctorProfile(null);
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    const res = await authService.updateProfile(profileData);
    setUser(res.data.user);
    return res;
  };

  const value = {
    user,
    doctorProfile,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    refreshUser: checkAuth,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    isDoctor: user?.role === 'doctor',
    isPatient: user?.role === 'patient',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
