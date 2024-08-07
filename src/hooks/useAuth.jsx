import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backengine-nqhbcnzf.fly.dev/api',
});

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    token: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthState({ isAuthenticated: true, token });
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/login', { username, password });
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        setAuthState({ isAuthenticated: true, token: response.data.token });
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthState({ isAuthenticated: false, token: null });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
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
