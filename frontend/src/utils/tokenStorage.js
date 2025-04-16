import { secureStorage } from './cryptoHelper';
import { createLogger } from './logger';

const logger = createLogger('TokenStorage');
const TOKEN_KEY = 'auth_token';
// Nyckel för direkt tillgänglig kopia av token (Nu krypterad)
const RAW_TOKEN_KEY = 'raw_token';

export const setAuthToken = (token) => {
  if (!token) {
    logger.warn('Försök att spara tomt token');
    return;
  }
  
  try {
    // Spara krypterad version
    secureStorage.setItem(TOKEN_KEY, token);
    
    // Spara även en krypterad version för bakåtkompatibilitet
    secureStorage.setItem(RAW_TOKEN_KEY, token);
    
    logger.info('Token sparad (krypterad)');
  } catch (error) {
    logger.error('Fel vid sparande av token:', error);
    // Fallback om det inte fungerar alls
    try {
      localStorage.setItem('fallback_token', token);
      logger.info('Token sparad i fallback-läge (okrypterad)');
    } catch (fallbackError) {
      logger.error('Fallback token sparande misslyckades också:', fallbackError);
    }
  }
};

export const getAuthToken = () => {
  try {
    // Först: försök hämta token från vår krypterade lagring
    let token = secureStorage.getItem(RAW_TOKEN_KEY);
    if (token) {
      logger.info('Token hämtad från krypterad storage');
      return token;
    }
    
    // Försök med gamla nyckeln (för bakåtkompatibilitet)
    token = secureStorage.getItem(TOKEN_KEY);
    if (token) {
      logger.info('Token hämtad från krypterad storage (old key)');
      return token;
    }
    
    // För bakåtkompatibilitet: kontrollera om det finns en okrypterad token
    token = localStorage.getItem(RAW_TOKEN_KEY);
    if (token) {
      logger.warn('Token hittades i okrypterad lagring. Kommer att krypteras.');
      // Migrera token till krypterad lagring
      setAuthToken(token);
      return token;
    }
    
    // Sista fallback till fallback_token
    token = localStorage.getItem('fallback_token');
    if (token) {
      logger.warn('Token hämtad från fallback-lagring (okrypterad)');
      // Migrera token till krypterad lagring
      setAuthToken(token);
      return token;
    }
    
    if (!token) {
      logger.info('Ingen token hittades');
      // Rensa cachad användardata eftersom token inte finns
      removeUserData();
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
            removeUserData();
            secureStorage.removeItem(RAW_TOKEN_KEY);
            secureStorage.removeItem(TOKEN_KEY);
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
    removeUserData();
    return null;
  }
};

export const removeAuthToken = () => {
  try {
    secureStorage.removeItem(TOKEN_KEY);
    secureStorage.removeItem(RAW_TOKEN_KEY);
    localStorage.removeItem('fallback_token');
    localStorage.removeItem(RAW_TOKEN_KEY); // Ta även bort från okrypterad lagring om den finns
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

// Hjälpfunktion för att ta bort användardata
const removeUserData = () => {
  secureStorage.removeItem('userData');
  localStorage.removeItem('userData');
}; 