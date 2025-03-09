import api from './api';

class SecurityError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'SecurityError';
    this.statusCode = statusCode;
  }
}

const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    throw new SecurityError(data.message || getDefaultErrorMessage(status), status);
  }
  throw new SecurityError('Kunde inte ansluta till servern', 0);
};

const getDefaultErrorMessage = (status) => {
  switch (status) {
    case 400:
      return 'Ogiltig förfrågan';
    case 401:
      return 'Åtkomst nekad';
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

const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/api/security/request-password-reset', { email });
    return response.data;
  } catch (error) {
    handleApiError(error);
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
    handleApiError(error);
  }
};

const requestEmailChange = async (newEmail) => {
  try {
    const response = await api.post('/api/security/request-email-change', { newEmail });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const confirmEmailChange = async (token) => {
  try {
    const response = await api.post('/api/security/confirm-email', { token });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const securityService = {
  requestPasswordReset,
  resetPassword,
  requestEmailChange,
  confirmEmailChange
};

export default securityService; 