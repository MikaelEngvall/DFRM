import axios from 'axios';
import { getAuthToken, removeAuthToken } from '../utils/tokenStorage';
import { validateJwtToken, handleAuthStatusError } from '../utils/errorHandler';
import { createLogger } from '../utils/logger';

const logger = createLogger('API');

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor för att hantera autentisering
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    
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
      
      // Använd den centrala metoden för att hantera autentiseringsfel
      handleAuthStatusError(status, config);
    } else if (error.request) {
      logger.error('Nätverksfel - Ingen respons från servern:', error.message);
    } else {
      logger.error('Fel vid request setup:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 