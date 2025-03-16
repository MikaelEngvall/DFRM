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
    console.log('Token finns i headers');
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