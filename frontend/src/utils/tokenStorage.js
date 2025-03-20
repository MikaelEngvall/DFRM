import SecureStorage from './secureStorage';

const TOKEN_KEY = 'auth_token';
const secureStorage = new SecureStorage('auth');

export const setAuthToken = (token) => {
  if (!token) {
    return;
  }
  secureStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = () => {
  try {
    const token = secureStorage.getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }
    return token;
  } catch (error) {
    console.error('Fel vid hämtning av token:', error);
    return null;
  }
};

export const removeAuthToken = () => {
  secureStorage.removeItem(TOKEN_KEY);
};

export const hasAuthToken = () => {
  return !!getAuthToken();
}; 