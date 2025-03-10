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
    console.log(`API-anrop: ${config.method.toUpperCase()} ${config.url} med token`);
  } else {
    console.log(`API-anrop: ${config.method.toUpperCase()} ${config.url} utan token`);
  }
  return config;
});

// Interceptor för att hantera fel
api.interceptors.response.use(
  (response) => response,
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
          console.error('Åtkomst nekad');
          break;
        case 404:
          console.error('Resursen hittades inte');
          break;
        default:
          console.error('Ett fel uppstod:', error.response.data.message);
      }
    } else if (error.request) {
      console.error('Ingen respons från servern');
    } else {
      console.error('Ett fel uppstod:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 