import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backengine-nqhbcnzf.fly.dev',
});

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await api.get('/api/collections/users/auth-refresh', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.record);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/collections/users/auth-with-password', { email, password });
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        setIsAuthenticated(true);
        setUser(response.data.record);
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
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
