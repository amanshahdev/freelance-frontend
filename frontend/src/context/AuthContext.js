/**
 * context/AuthContext.js
 *
 * WHAT: React context that holds the authenticated user and provides
 *       login / logout / updateUser helpers globally.
 * HOW:  Reads token + user from localStorage on mount, verifies with /auth/me,
 *       then exposes state via useAuth() hook.
 * WHY:  Avoids prop-drilling auth state through every component tree.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, getErrorMessage } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while we verify token on mount

  // ── On mount: restore session ──────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }

      try {
        const res = await authAPI.getMe();
        setUser(res.data.user);
      } catch {
        // Token invalid / expired — clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // ── login ──────────────────────────────────────────────────────────────
  const login = useCallback((token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  // ── logout ─────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // ── updateUser ─────────────────────────────────────────────────────────
  const updateUser = useCallback((updatedData) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedData };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  }, []);

  const value = { user, loading, login, logout, updateUser, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
