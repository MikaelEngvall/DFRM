import api from './api';

const TOKEN_KEY = 'auth_token';

class AuthError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  delete api.defaults.headers.common['Authorization'];
};

const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    switch (status) {
      case 400:
        throw new AuthError('Ogiltig förfrågan', status);
      case 401:
        throw new AuthError('Felaktiga inloggningsuppgifter', status);
      case 403:
        throw new AuthError('Åtkomst nekad', status);
      case 404:
        throw new AuthError('Resursen hittades inte', status);
      case 429:
        throw new AuthError('För många försök. Försök igen senare.', status);
      case 500:
        throw new AuthError('Serverfel. Försök igen senare.', status);
      default:
        throw new AuthError(data.message || 'Ett okänt fel uppstod', status);
    }
  }
  throw new AuthError('Kunde inte ansluta till servern', 0);
};

const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;
    setToken(token);
    return user;
  } catch (error) {
    handleApiError(error);
  }
};

const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    removeToken();
  }
};

const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      throw new AuthError('Ingen token hittades', 401);
    }
    
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    removeToken();
    handleApiError(error);
  }
};

const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    const { token, user } = response.data;
    setToken(token);
    return user;
  } catch (error) {
    handleApiError(error);
  }
};

const updateProfile = async (userData) => {
  try {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/auth/reset-password-request', { email });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const isAuthenticated = () => {
  return !!localStorage.getItem(TOKEN_KEY);
};

const authService = {
  login,
  logout,
  getCurrentUser,
  register,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  isAuthenticated,
};

export default authService; 