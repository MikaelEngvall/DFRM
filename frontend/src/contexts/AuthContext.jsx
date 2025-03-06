import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import sessionManager from '../utils/sessionManager';
import SessionWarning from '../components/SessionWarning';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionRemainingTime, setSessionRemainingTime] = useState(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  const checkAuthStatus = useCallback(async () => {
    if (isCheckingAuth) return;
    
    try {
      setIsCheckingAuth(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setUser(null);
        return;
      }

      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
      console.error('Auth check error:', error);
    } finally {
      setIsCheckingAuth(false);
      setLoading(false);
    }
  }, [isCheckingAuth]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (user) {
      initializeSessionManager();
    }
    return () => {
      sessionManager.cleanup();
    };
  }, [user]);

  const initializeSessionManager = () => {
    sessionManager.init(
      // Varningshanterare
      (remainingTime) => {
        setSessionRemainingTime(remainingTime);
        setShowSessionWarning(true);
      },
      // Utloggningshanterare
      () => {
        logout();
      }
    );
  };

  const login = async (credentials) => {
    try {
      const userData = await authService.login(credentials);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setShowSessionWarning(false);
      navigate('/login');
    }
  };

  const extendSession = () => {
    sessionManager.handleUserActivity();
    setShowSessionWarning(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const value = {
    user,
    login,
    logout,
    extendSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showSessionWarning && (
        <SessionWarning
          remainingTime={sessionRemainingTime}
          onExtend={extendSession}
          onLogout={logout}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth måste användas inom en AuthProvider');
  }
  return context;
};

export default AuthContext; 