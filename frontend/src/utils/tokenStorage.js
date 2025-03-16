import SecureStorage from './secureStorage';

const TOKEN_KEY = 'auth_token';
const secureStorage = new SecureStorage('auth');

export const setAuthToken = (token) => {
  if (!token) {
    console.log('Försöker sätta null/undefined token');
    return;
  }
  console.log('Sparar token');
  secureStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = () => {
  try {
    const token = secureStorage.getItem(TOKEN_KEY);
    if (!token) {
      console.log('Ingen token hittades');
      return null;
    }
    console.log('Hämtar token');
    return token;
  } catch (error) {
    console.error('Fel vid hämtning av token:', error);
    return null;
  }
};

export const removeAuthToken = () => {
  console.log('Tar bort token');
  secureStorage.removeItem(TOKEN_KEY);
};

export const hasAuthToken = () => {
  return !!getAuthToken();
}; 