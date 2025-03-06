import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor för att hantera autentisering
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
          localStorage.removeItem('token');
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