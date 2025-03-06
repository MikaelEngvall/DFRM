import api from './api';

const TOKEN_KEY = 'auth_token';

const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  delete api.defaults.headers.common['Authorization'];
};

const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;
    setToken(token);
    return user;
  } catch (error) {
    throw new Error('Inloggningen misslyckades');
  }
};

const logout = async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    removeToken();
  }
};

const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      throw new Error('Ingen token hittades');
    }
    
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    removeToken();
    throw error;
  }
};

const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  const { token, user } = response.data;
  setToken(token);
  return user;
};

const authService = {
  login,
  logout,
  getCurrentUser,
  register,

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
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

export default authService; 