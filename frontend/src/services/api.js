import axios from 'axios';
import { getAuthToken, removeAuthToken } from '../utils/tokenStorage';
import { validateJwtToken, handleAuthStatusError } from '../utils/errorHandler';
import { createLogger } from '../utils/logger';

const logger = createLogger('API');

// Skapa API-instans med grundkonfiguration
const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
  // Inget withCredentials eftersom det orsakar CORS-problem
  // CORS-headers ska sättas på server-sidan, inte i klienten
});

// Interceptor för att hantera autentisering
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    // Se till att token har rätt format (Bearer prefix)
    if (token.startsWith('Bearer ')) {
      config.headers.Authorization = token;
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Använd valideringsfunktionen från errorHandler för att validera token
    const validation = validateJwtToken(token);
    
    // Logga endast om token är ogiltig eller nära att löpa ut
    if (!validation.valid) {
      logger.warn('Ogiltigt token används i request:', validation.error);
    } else if (validation.expiry) {
      const now = new Date();
      const diff = validation.expiry.getTime() - now.getTime();
      const minutesRemaining = Math.floor(diff / 60000);
      
      // Varna om token löper ut inom 5 minuter
      if (minutesRemaining < 5) {
        logger.warn(`Token löper ut snart (${minutesRemaining} minuter kvar)`);
      }
    }
  }
  
  logger.debug(`API request: ${config.method?.toUpperCase()} ${config.url}`, { 
    hasToken: !!token
  });
  
  return config;
});

// Interceptor för att hantera fel
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, config } = error.response;
      
      logger.error(`API error response: ${status} for ${config.method?.toUpperCase()} ${config.url}`, { 
        data: error.response.data
      });
      
      // Hantera olika felkoder
      if (status === 401) {
        // Ogiltig eller utgången token, logga ut
        logger.error('401 Unauthorized - Token ogiltig eller saknas');
        removeAuthToken();
        // Använd den centrala metoden för att hantera autentiseringsfel
        handleAuthStatusError(status, config);
      } else if (status === 403) {
        // 403 Forbidden - Kan betyda att tokenet är giltigt men saknar behörighet
        logger.error('403 Forbidden - Användaren saknar behörighet', { url: config.url });
        
        // Om detta anrop är till /api/auth/me, logga mer information men fortsätt sessionen
        if (config.url?.includes('/api/auth/me')) {
          logger.error('403 på /api/auth/me - Token kan behöva förnyas men avbryter inte nuvarande session');
          // Skicka vidare felet så att anroparen kan hantera det
          return Promise.reject(error);
        }
        
        // För andra anrop, hantera som vanligt
        handleAuthStatusError(status, config);
      } else {
        // Andra HTTP-fel 
        logger.error(`API Error (${status}):`, config?.method?.toUpperCase(), config?.url);
      }
    } else if (error.request) {
      logger.error('Nätverksfel - Ingen respons från servern:', error.message);
    } else {
      logger.error('Fel vid request setup:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 