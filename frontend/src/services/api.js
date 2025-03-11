import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor för att hantera autentisering
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    
    // Behåll bara loggning för POST till /api/apartments
    if (config.method.toUpperCase() === 'POST' && config.url === '/api/apartments') {
      console.log('==== POST TILL /api/apartments ====');
      console.log('REQUEST BODY:', JSON.stringify(config.data, null, 2));
      console.log('TOKEN (första 30 tecken):', token.substring(0, 30) + '...');
    }
  }
  return config;
});

// Interceptor för att hantera fel
api.interceptors.response.use(
  (response) => {
    // Behåll bara loggning för POST till /api/apartments
    if (response.config.method.toUpperCase() === 'POST' && response.config.url === '/api/apartments') {
      console.log('==== SVAR FRÅN /api/apartments ====');
      console.log('STATUS:', response.status);
      console.log('RESPONSE BODY:', response.data);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // Behåll bara loggning för POST till /api/apartments
      if (error.config && error.config.method.toUpperCase() === 'POST' && error.config.url === '/api/apartments') {
        console.log('==== FEL VID POST TILL /api/apartments ====');
        console.log('STATUS:', error.response.status);
        console.log('ERROR DATA:', error.response.data);
      }
      
      // Hantera specifika felkoder
      switch (error.response.status) {
        case 401:
          // Omdirigera till inloggningssidan vid ogiltig token
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
          break;
        case 403:
          break;
        case 404:
          break;
        default:
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