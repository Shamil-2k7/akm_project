'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, getDeviceId } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('akm_lms_token');
      if (token) {
        try {
          const data = await apiRequest('/auth/me');
          setUser(data.user);
        } catch (err) {
          console.error('Session restoration failed:', err.message);
          // ApiRequest will try refresh; if that failed, it clears local state.
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (phone, password) => {
    setLoading(true);
    const deviceId = getDeviceId();
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password, deviceId }),
      });

      localStorage.setItem('akm_lms_token', data.accessToken);
      localStorage.setItem('akm_lms_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (name, phone, password) => {
    setLoading(true);
    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, phone, password }),
      });
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    setLoading(true);
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout request failed:', err.message);
    } finally {
      localStorage.removeItem('akm_lms_token');
      localStorage.removeItem('akm_lms_user');
      setUser(null);
      setLoading(false);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
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
