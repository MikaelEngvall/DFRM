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
    
    // Loggning för specifika endpoints
    if (config.method.toUpperCase() === 'POST' && config.url === '/api/apartments') {
      console.log('==== POST TILL /api/apartments ====');
      console.log('REQUEST BODY:', JSON.stringify(config.data, null, 2));
      console.log('TOKEN (första 30 tecken):', token.substring(0, 30) + '...');
    }
    
    // Lägg till loggning för PATCH till nycklar/apartment
    if (config.method.toUpperCase() === 'PATCH' && config.url.includes('/api/keys/') && config.url.includes('/apartment')) {
      console.log('==== PATCH TILL /api/keys/.../apartment ====');
      console.log('URL:', config.url);
      console.log('PARAMS:', config.params);
      console.log('TOKEN (första 30 tecken):', token.substring(0, 30) + '...');
    }
  }
  return config;
});

// Interceptor för att hantera fel
api.interceptors.response.use(
  (response) => {
    // Loggning för specifika endpoints
    if (response.config.method.toUpperCase() === 'POST' && response.config.url === '/api/apartments') {
      console.log('==== SVAR FRÅN /api/apartments ====');
      console.log('STATUS:', response.status);
      console.log('RESPONSE BODY:', response.data);
    }
    
    // Lägg till loggning för framgångsrika PATCH till nycklar/apartment
    if (response.config.method.toUpperCase() === 'PATCH' && response.config.url.includes('/api/keys/') && response.config.url.includes('/apartment')) {
      console.log('==== LYCKAT SVAR FRÅN /api/keys/.../apartment ====');
      console.log('STATUS:', response.status);
      console.log('RESPONSE BODY:', response.data);
    }
    
    return response;
  },
  (error) => {
    if (error.response) {
      // Loggning för specifika endpoints
      if (error.config && error.config.method.toUpperCase() === 'POST' && error.config.url === '/api/apartments') {
        console.log('==== FEL VID POST TILL /api/apartments ====');
        console.log('STATUS:', error.response.status);
        console.log('ERROR DATA:', error.response.data);
      }
      
      // Lägg till loggning för fel vid PATCH till nycklar/apartment
      if (error.config && error.config.method.toUpperCase() === 'PATCH' && error.config.url.includes('/api/keys/') && error.config.url.includes('/apartment')) {
        console.log('==== FEL VID PATCH TILL /api/keys/.../apartment ====');
        console.log('STATUS:', error.response.status);
        console.log('ERROR DATA:', error.response.data);
        console.log('HEADERS:', error.response.headers);
        console.log('REQUEST CONFIG:', {
          url: error.config.url,
          method: error.config.method,
          headers: error.config.headers
        });
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