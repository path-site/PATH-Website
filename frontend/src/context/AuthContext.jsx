import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('path_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('path_admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('path_admin_token');
      if (storedToken) {
        try {
          const res = await adminApi.getMe();
          const userData = res?.data || res;
          if (userData && (userData.email || userData.fullName)) {
            setUser(userData);
            localStorage.setItem('path_admin_user', JSON.stringify(userData));
          }
        } catch (err) {
          // If token expired or invalid, log out
          logout();
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, []);

  const login = async (email, password) => {
    const res = await adminApi.login({ email, password });
    // Interceptor returns response.data: { success, message, data: { token, ... } }
    const loginData = res?.data || res;
    if ((res?.success || loginData?.token) && loginData?.token) {
      setToken(loginData.token);
      setUser(loginData);
      localStorage.setItem('path_admin_token', loginData.token);
      localStorage.setItem('path_admin_user', JSON.stringify(loginData));
      return loginData;
    }
    throw new Error(res?.message || 'Login failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('path_admin_token');
    localStorage.removeItem('path_admin_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
