import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, getMe } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('taskflow_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('taskflow_token') || null);
  const [loading, setLoading] = useState(true);

  // Verify stored token on app load
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('taskflow_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await getMe();
        if (response.success && response.data.user) {
          setUser(response.data.user);
          localStorage.setItem('taskflow_user', JSON.stringify(response.data.user));
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err.message);
        localStorage.removeItem('taskflow_token');
        localStorage.removeItem('taskflow_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await loginUser({ email, password });
    if (response.success && response.data) {
      const { user: authUser, token: authToken } = response.data;
      setUser(authUser);
      setToken(authToken);
      localStorage.setItem('taskflow_token', authToken);
      localStorage.setItem('taskflow_user', JSON.stringify(authUser));
      return response;
    }
    throw new Error(response.message || 'Login failed');
  }, []);

  const register = useCallback(async (name, email, password) => {
    const response = await registerUser({ name, email, password });
    if (response.success && response.data) {
      const { user: authUser, token: authToken } = response.data;
      setUser(authUser);
      setToken(authToken);
      localStorage.setItem('taskflow_token', authToken);
      localStorage.setItem('taskflow_user', JSON.stringify(authUser));
      return response;
    }
    throw new Error(response.message || 'Registration failed');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    setUser(null);
    setToken(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
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
