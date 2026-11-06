import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cravewise_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user session on mount
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.warn('[AuthContext] Session invalid, clearing token:', err.message);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password, role = 'customer') => {
    const res = await API.post('/auth/login', { email, password, role });
    if (res.success && res.data.token) {
      localStorage.setItem('cravewise_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data);
      return res.data;
    }
  };

  const completeOAuth = async (oauthToken) => {
    localStorage.setItem('cravewise_token', oauthToken);
    try {
      const res = await API.get('/auth/me');
      setToken(oauthToken);
      setUser(res.data);
      return res.data;
    } catch (error) {
      localStorage.removeItem('cravewise_token');
      throw error;
    }
  };

  const register = async (formData, isRestaurant = false) => {
    const endpoint = isRestaurant ? '/auth/register-restaurant' : '/auth/register';
    const res = await API.post(endpoint, formData);
    if (res.success && res.data.token) {
      localStorage.setItem('cravewise_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('cravewise_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const res = await API.put('/auth/profile', updates);
    if (res.success) {
      setUser(res.data);
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        loading,
        login,
        completeOAuth,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
