import { useState, useEffect, createContext, useContext } from 'react';
import { koxyAPI } from 'koxy-js';

const api = new koxyAPI("m1OlWDWBaw2r5FQrmWvWEdSW_S6unteHK4dS8RQk5VU.GW6sdI6y7UoVI9sOO6OVUuHlBjR77J5Zm17aWmHDBhw", "XCQCQtKOf8kU40mmAaKt1KUkiDObCADqLiUdkgr_-XA.dqqcfN_G2tYAVSvsetdwYinj0ayHsdpf21KMA1BtHc0");

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const result = await api.run("login", { username, password });
      if (result.token) {
        localStorage.setItem('authToken', result.token);
        setIsAuthenticated(true);
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
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
