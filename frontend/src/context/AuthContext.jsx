import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists on load
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    const username = localStorage.getItem('username');

    if (token && username) {
      setUser({ username, role });
      // Validate in background
      api.getMe()
        .then((userData) => {
          if (userData) setUser(userData);
        })
        .catch(() => {
          api.logout();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    setUser({ username: data.username, role: data.role });
    return data;
  };

  const register = async (username, email, password, role = 'user') => {
    await api.register(username, email, password, role);
    return await login(username, password);
  };

  const quickAdminLogin = async () => {
    return await login('admin', 'admin123');
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role || 'guest', login, register, quickAdminLogin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
