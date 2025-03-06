import React, { createContext, useState, useContext, useEffect } from 'react';
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

  useEffect(() => {
    checkAuthStatus();
  }, []);

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
        handleLogout();
      }
    );
  };

  const checkAuthStatus = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    const userData = await authService.login(credentials);
    setUser(userData);
    return userData;
  };

  const handleLogout = async () => {
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

  return (
    <AuthContext.Provider value={{ user, login: handleLogin, logout: handleLogout }}>
      {children}
      {showSessionWarning && (
        <SessionWarning
          remainingTime={sessionRemainingTime}
          onExtend={extendSession}
          onLogout={handleLogout}
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