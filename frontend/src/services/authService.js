import api from './api';

const authService = {
  // Logga in användare
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Logga ut användare
  logout: () => {
    localStorage.removeItem('token');
  },

  // Registrera ny användare
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Hämta aktuell användare
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Uppdatera användarens profil
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  // Ändra lösenord
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Återställ lösenord (skicka återställningslänk)
  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/reset-password-request', { email });
    return response.data;
  },

  // Återställ lösenord (med token)
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },

  // Kontrollera om användaren är inloggad
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService; 