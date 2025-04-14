import SecureStorage from './secureStorage';
import { createLogger } from './logger';

const logger = createLogger('TokenStorage');
const TOKEN_KEY = 'auth_token';
// Nyckel för direkt tillgänglig kopia av token (ej krypterad)
const RAW_TOKEN_KEY = 'raw_token';
const secureStorage = new SecureStorage('auth');

export const setAuthToken = (token) => {
  if (!token) {
    logger.warn('Försök att spara tomt token');
    return;
  }
  
  try {
    // Spara krypterad version
    secureStorage.setItem(TOKEN_KEY, token);
    
    // Spara även en okrypterad (raw) version som kan användas direkt utan dekryptering
    // Detta hjälper när sidan laddas om, innan SecureStorage är initierad
    localStorage.setItem(RAW_TOKEN_KEY, token);
    
    logger.info('Token sparad (både krypterad och raw)');
  } catch (error) {
    logger.error('Fel vid sparande av token:', error);
    // Fallback till vanlig localStorage om SecureStorage misslyckas
    try {
      localStorage.setItem('fallback_token', token);
      logger.info('Token sparad i fallback-läge');
    } catch (fallbackError) {
      logger.error('Fallback token sparande misslyckades också:', fallbackError);
    }
  }
};

export const getAuthToken = () => {
  try {
    // Först: försök hämta raw token som inte kräver dekryptering
    let token = localStorage.getItem(RAW_TOKEN_KEY);
    if (token) {
      logger.info('Token hämtad från raw storage');
      return token;
    }
    
    // Fallback: Försök hämta token från säker lagring
    token = secureStorage.getItem(TOKEN_KEY);
    
    // Om token inte finns i secureStorage, försök fallback
    if (!token) {
      token = localStorage.getItem('fallback_token');
      if (token) {
        logger.warn('Token hämtad från fallback-lagring');
      }
    }
    
    if (!token) {
      logger.info('Ingen token hittades');
      // Rensa cachad användardata eftersom token inte finns
      localStorage.removeItem('userData');
      return null;
    }
    
    // Validera token så den inte har utgått
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        // Kontrollera utgångstid
        if (payload.exp) {
          const expDate = new Date(payload.exp * 1000);
          const now = new Date();
          
          if (expDate < now) {
            logger.warn('Token har löpt ut, raderar cachad användardata');
            localStorage.removeItem('userData');
            localStorage.removeItem(RAW_TOKEN_KEY);
            return null;
          }
        }
      }
    } catch (error) {
      logger.error('Fel vid validering av token:', error);
    }
    
    logger.info('Token hämtad');
    return token;
  } catch (error) {
    logger.error('Fel vid hämtning av token:', error);
    
    // Försök med fallback om huvudmetoden misslyckades
    try {
      const fallbackToken = localStorage.getItem('fallback_token');
      if (fallbackToken) {
        logger.warn('Fallback token hämtad efter fel');
        return fallbackToken;
      }
    } catch (fallbackError) {
      logger.error('Kunde inte hämta fallback token:', fallbackError);
    }
    
    // Rensa cachad användardata vid fel
    localStorage.removeItem('userData');
    return null;
  }
};

export const removeAuthToken = () => {
  try {
    secureStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('fallback_token');
    localStorage.removeItem(RAW_TOKEN_KEY);
    logger.info('Token borttagen (krypterad, fallback och raw)');
  } catch (error) {
    logger.error('Fel vid borttagning av token:', error);
  }
};

export const hasAuthToken = () => {
  const hasToken = !!getAuthToken();
  logger.info(`Kontroll om token finns: ${hasToken}`);
  return hasToken;
}; 