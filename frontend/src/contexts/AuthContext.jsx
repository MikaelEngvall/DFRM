import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userService } from '../services';
import sessionManager from '../utils/sessionManager';
import SessionWarning from '../components/SessionWarning';
import { getAuthToken, removeAuthToken } from '../utils/tokenStorage';
import { createLogger } from '../utils/logger';
import { validateJwtToken } from '../utils/errorHandler';
import { secureStorage } from '../utils/cryptoHelper';

const logger = createLogger('AuthContext');
const AuthContext = createContext(null);

// Konstanter för storage-nycklar
const USER_DATA_KEY = 'userData';

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
      logger.error('Error fetching users in auth context:', error);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    if (authCheckRef.current) return;
    authCheckRef.current = true;
    logger.info('Kontrollerar autentisering...');

    try {
      const token = getAuthToken();
      if (!token) {
        logger.info('Ingen token hittades');
        setUser(null);
        secureStorage.removeItem(USER_DATA_KEY);
        localStorage.removeItem(USER_DATA_KEY); // För bakåtkompatibilitet
        setLoading(false);
        return;
      }

      // Kontrollera först om vi har cachad användardata i krypterad lagring
      let userData = secureStorage.getItem(USER_DATA_KEY);
      
      // Om ingen krypterad data, kontrollera efter okrypterad data (för bakåtkompatibilitet)
      if (!userData) {
        const cachedUserData = localStorage.getItem(USER_DATA_KEY);
        
        if (cachedUserData) {
          try {
            userData = JSON.parse(cachedUserData);
            logger.info('Hittade okrypterad användardata, flyttar till krypterad lagring', { userId: userData.id, role: userData.role });
            
            // Migrera data till krypterad lagring
            secureStorage.setItem(USER_DATA_KEY, userData);
            
            // Ta bort okrypterad efter migrering (valfritt, men rekommenderat för säkerhet)
            localStorage.removeItem(USER_DATA_KEY);
          } catch (error) {
            logger.error('Kunde inte parsa cachad användardata:', error);
          }
        }
      } else {
        logger.info('Hittade cachad användardata i krypterad lagring', { userId: userData.id, role: userData.role });
      }

      // Försök hämta användardata från backend även om vi har cachad data
      try {
        logger.info('Token hittad, hämtar användardata från API...');
        const serverUserData = await authService.getCurrentUser();
        logger.info('Användardata hämtad från API, användare inloggad', { userId: serverUserData.id, role: serverUserData.role });
        
        // Uppdatera cachad användardata i krypterad lagring
        secureStorage.setItem(USER_DATA_KEY, serverUserData);
        
        // Använd server-data
        setUser(serverUserData);
      } catch (error) {
        // Om API-anrop misslyckas, använd cachad användardata om sådan finns
        if (userData) {
          logger.warn('Kunde inte hämta uppdaterad användardata från API, använder cachad data', 
            { error: error.message, status: error.response?.status });
          
          // Validera token för att säkerställa att den inte har utgått
          const validation = validateJwtToken(token);
          if (validation.valid) {
            logger.info('Token fortfarande giltig, fortsätter session med cachad användardata');
            setUser(userData);
          } else {
            logger.error('Token ogiltig men finns i localStorage:', validation.error);
            setUser(null);
            removeAuthToken();
            secureStorage.removeItem(USER_DATA_KEY);
            localStorage.removeItem(USER_DATA_KEY); // För bakåtkompatibilitet
          }
        } else {
          // Ingen cachad data och API-anrop misslyckades
          logger.error('Fel vid autentkontroll och ingen cachad data:', error);
          setUser(null);
          removeAuthToken();
        }
      }
    } catch (error) {
      logger.error('Autentiseringskontroll misslyckades:', error);
      setUser(null);
      removeAuthToken();
      secureStorage.removeItem(USER_DATA_KEY);
      localStorage.removeItem(USER_DATA_KEY); // För bakåtkompatibilitet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
      },
      // Skicka med användarrollen
      user.role
    );
  };

  const login = async (credentials) => {
    try {
      const userData = await authService.login(credentials);
      setUser(userData);
      
      // Spara användardata i krypterad lagring för att återställa session vid sidladdning
      secureStorage.setItem(USER_DATA_KEY, userData);
      
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    removeAuthToken();
    secureStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(USER_DATA_KEY); // För bakåtkompatibilitet
    setShowSessionWarning(false);
    navigate('/login');
  }, [navigate]);

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