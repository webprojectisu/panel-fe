import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    setIsAuthLoading(false);
  }, []);

  async function login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Giriş başarısız',
      };
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // fire-and-forget — ignore errors
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
