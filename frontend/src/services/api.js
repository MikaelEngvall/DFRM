import axios from 'axios';
import { getAuthToken } from './authService';

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
  }
  return config;
});

// Interceptor för att hantera fel
api.interceptors.response.use(
  (response) => {
    // Loggning för specifika endpoints
    
    return response;
  },
  (error) => {
    if (error.response) {
      
      // Hantera specifika felkoder
      switch (error.response.status) {
        case 401:
          // Omdirigera till inloggningssidan vid ogiltig token
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
          break;
        case 403:
          console.log('403 Forbidden:', error.config.url);
          break;
        case 404:
          console.log('404 Not Found:', error.config.url);
          break;
        default:
          console.log(`${error.response.status} Error:`, error.config.url);
          break;
      }
    } else if (error.request) {
      // Behåll bara loggning för POST till /api/apartments
      if (error.config && error.config.method.toUpperCase() === 'POST' && error.config.url === '/api/apartments') {
        console.log('==== INGET SVAR VID POST TILL /api/apartments ====');
        console.log('REQUEST:', error.request);
      }
    } else {
      // Behåll bara loggning för POST till /api/apartments
      if (error.config && error.config.method.toUpperCase() === 'POST' && error.config.url === '/api/apartments') {
        console.log('==== FEL VID REQUEST SETUP FÖR /api/apartments ====');
        console.log('ERROR MESSAGE:', error.message);
      }
    }
    return Promise.reject(error);
  }
);

export default api; 