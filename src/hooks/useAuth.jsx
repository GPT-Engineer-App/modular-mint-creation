import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://cors-anywhere.herokuapp.com/https://backengine-nqhbcnzf.fly.dev',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const fetchUserProfile = useCallback(async (token) => {
    try {
      const response = await api.get('/api/collections/users/auth-refresh', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.record);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      fetchUserProfile(token);
    }
  }, [fetchUserProfile]);

  const login = useCallback(async (email, password) => {
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
  }, []);

  const signup = useCallback(async (email, password) => {
    try {
      const response = await api.post('/api/collections/users/records', { email, password });
      if (response.data.id) {
        // After successful signup, log the user in
        await login(email, password);
      } else {
        throw new Error('Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const value = React.useMemo(() => ({
    isAuthenticated,
    user,
    login,
    signup,
    logout
  }), [isAuthenticated, user, login, signup, logout]);

  return (
    <AuthContext.Provider value={value}>
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

export { AuthProvider };
export default useAuth;
