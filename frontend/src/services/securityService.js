import api from './api';
import { SecurityError, handleSecurityError } from '../utils/errorHandler';
import { createLogger } from '../utils/logger';

const logger = createLogger('SecurityService');

const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/api/security/request-password-reset', { email });
    return response.data;
  } catch (error) {
    handleSecurityError(error);
  }
};

const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post('/api/security/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  } catch (error) {
    handleSecurityError(error);
  }
};

const requestEmailChange = async (newEmail) => {
  try {
    const response = await api.post('/api/security/request-email-change', { newEmail });
    return response.data;
  } catch (error) {
    handleSecurityError(error);
  }
};

const confirmEmailChange = async (token) => {
  try {
    const response = await api.post('/api/security/confirm-email', { token });
    return response.data;
  } catch (error) {
    handleSecurityError(error);
  }
};

const securityService = {
  requestPasswordReset,
  resetPassword,
  requestEmailChange,
  confirmEmailChange
};

export default securityService; 