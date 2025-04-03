import api from './api';
import { setAuthToken, removeAuthToken, getAuthToken } from '../utils/tokenStorage';
import { AuthError, handleAuthError } from '../utils/errorHandler';
import { createLogger } from '../utils/logger';

const logger = createLogger('AuthService');
const TOKEN_KEY = 'auth_token';

const login = async (credentials) => {
  try {
    const response = await api.post('/api/auth/login', credentials);
    const { token, user } = response.data;
    setAuthToken(token);
    return user;
  } catch (error) {
    logger.error('Login error:', error);
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
    logger.error('Get current user error:', error);
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
    handleAuthError(error);
  }
};

const updateProfile = async (userData) => {
  try {
    const response = await api.patch('/api/auth/profile', userData);
    return response.data;
  } catch (error) {
    logger.error('Error updating user profile:', error);
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
    handleAuthError(error);
  }
};

const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/api/auth/reset-password-request', { email });
    return response.data;
  } catch (error) {
    handleAuthError(error);
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
    handleAuthError(error);
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