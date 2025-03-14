import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userService } from '../services';
import sessionManager from '../utils/sessionManager';
import SessionWarning from '../components/SessionWarning';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionRemainingTime, setSessionRemainingTime] = useState(0);
  const authCheckRef = useRef(false);

  // Hämta alla användare
  const fetchUsers = useCallback(async () => {
    try {
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users in auth context:', error);
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    if (authCheckRef.current) return;
    authCheckRef.current = true;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setUser(null);
        return;
      }

      const userData = await authService.getCurrentUser();
      setUser(userData);
      
      // Hämta alla användare om inloggad
      fetchUsers();
    } catch (error) {
      setUser(null);
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

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
      console.log('Användare inloggad med roll:', userData.role);
      setUser(userData);
      
      // Omdirigera USER till kalendersidan, andra roller till dashboard
      if (userData.role === 'ROLE_USER' || userData.role === 'USER') {
        navigate('/calendar');
      } else {
        navigate('/');
      }
      
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    // JWT-baserad autentisering hanterar utloggning på klientsidan
    await authService.logout();
    setUser(null);
    setShowSessionWarning(false);
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const extendSession = () => {
    sessionManager.handleUserActivity();
    setShowSessionWarning(false);
  };

  // Hjälpfunktion för att kontrollera användarroller
  const hasRole = useCallback((requiredRoles) => {
    if (!user) return false;
    if (!Array.isArray(requiredRoles)) {
      requiredRoles = [requiredRoles];
    }
    const userRole = user.role.startsWith('ROLE_') ? user.role : `ROLE_${user.role}`;
    return requiredRoles.some(role => {
      const formattedRole = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
      return userRole === formattedRole;
    });
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const value = {
    user,
    users,
    login,
    logout,
    extendSession,
    hasRole,
    fetchUsers,
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