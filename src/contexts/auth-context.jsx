import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      authAPI.getCurrentUser()
        .then((userData) => {
          setUser(userData);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const sendOtp = async (email, mode) => {
    try {
      const response = await authAPI.sendOtp(email, mode);
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const response = await authAPI.verifyOtp(email, otp);
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials.email, credentials.password);
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (credentials) => {
    try {
      const response = await authAPI.signup(credentials.name, credentials.email, credentials.password);
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      logout();
      throw error;
    }
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      loading,
      sendOtp,
      verifyOtp,
      login,
      signup,
      logout,
      refreshUser,
    }),
    [isAuthenticated, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

