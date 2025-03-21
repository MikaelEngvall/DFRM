import api from './api';
import { setAuthToken, removeAuthToken, getAuthToken } from '../utils/tokenStorage';

const TOKEN_KEY = 'auth_token';

class AuthError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    throw new AuthError(data.message || getDefaultErrorMessage(status), status);
  }
  throw new AuthError('Kunde inte ansluta till servern', 0);
};

const getDefaultErrorMessage = (status) => {
  switch (status) {
    case 400:
      return 'Ogiltig förfrågan';
    case 401:
      return 'Felaktiga inloggningsuppgifter';
    case 403:
      return 'Åtkomst nekad';
    case 404:
      return 'Resursen hittades inte';
    case 429:
      return 'För många försök. Försök igen senare.';
    case 500:
      return 'Serverfel. Försök igen senare.';
    default:
      return 'Ett okänt fel uppstod';
  }
};

const login = async (credentials) => {
  try {
    const response = await api.post('/api/auth/login', credentials);
    const { token, user } = response.data;
    setAuthToken(token);
    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

const logout = () => {
  removeAuthToken();
};

const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

const register = async (userData) => {
  try {
    const response = await api.post('/api/auth/register', userData);
    const { token, user } = response.data;
    setAuthToken(token);
    return user;
  } catch (error) {
    handleApiError(error);
  }
};

const updateProfile = async (userData) => {
  try {
    const response = await api.patch('/api/auth/profile', userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post('/api/auth/change-password', {
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
    const response = await api.post('/api/auth/reset-password-request', { email });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post('/api/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const isAuthenticated = () => {
  return !!getAuthToken();
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