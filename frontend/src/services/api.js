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
    console.log('API Request:', config.method.toUpperCase(), config.url);
    console.log('Token finns i headers:', token.substring(0, 15) + '...');
    
    try {
      // Försök tolka JWT-token (base64-delen)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      console.log('Token payload:', payload);
      
      // Logga utgångstid om den finns
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        const now = new Date();
        console.log('Token expires:', expDate);
        console.log('Token valid:', expDate > now ? 'Yes' : 'NO - EXPIRED');
      }
    } catch (e) {
      console.log('Kunde inte avkoda token:', e);
    }
  } else {
    console.log('API Request:', config.method.toUpperCase(), config.url);
    console.log('Token saknas i headers');
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
      console.log(`API Error (${status}):`, config.method.toUpperCase(), config.url);
      
      // Hantera specifika felkoder
      switch (status) {
        case 401:
          console.log('401 Unauthorized - Tar bort token och omdirigerar till login');
          removeAuthToken();
          window.location.href = '/login';
          break;
        case 403:
          console.log('403 Forbidden - Behåller token men användaren saknar behörighet');
          break;
        case 404:
          console.log('404 Not Found - Resursen finns inte');
          break;
        default:
          console.log(`Oväntat fel (${status})`);
          break;
      }
    } else if (error.request) {
      console.log('Nätverksfel - Ingen respons från servern:', error.config?.url);
      console.log('Felmeddelande:', error.message);
    } else {
      console.log('Fel vid request setup:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 