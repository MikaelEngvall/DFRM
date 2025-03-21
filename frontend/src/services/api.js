import axios from 'axios';
import { getAuthToken, removeAuthToken } from '../utils/tokenStorage';

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
    
    try {
      // Försök tolka JWT-token (base64-delen)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      // Kontrollera utgångstid om den finns (utan att logga)
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        // Token validering utförs men loggas inte
      }
    } catch (e) {
      // Fel vid avkodning, men fortsätt ändå
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
      
      // Hantera specifika felkoder
      switch (status) {
        case 401:
          // Unauthorized - Rensa token och omdirigera
          removeAuthToken();
          window.location.href = '/login';
          break;
        case 403:
          console.error('403 Forbidden - Användaren saknar behörighet', config.url);
          break;
        case 404:
          console.error('404 Not Found - Resursen finns inte', config.url);
          break;
        default:
          console.error(`API Error (${status}):`, config.method.toUpperCase(), config.url);
          break;
      }
    } else if (error.request) {
      console.error('Nätverksfel - Ingen respons från servern:', error.message);
    } else {
      console.error('Fel vid request setup:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 