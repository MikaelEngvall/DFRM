import CryptoJS from 'crypto-js';
import { createLogger } from './logger';

const logger = createLogger('SecureStorage');

class SecureStorage {
  constructor(namespace) {
    this.namespace = namespace;
    this.secretKey = process.env.REACT_APP_STORAGE_KEY || 'default-secret-key-change-in-production';
    logger.info(`SecureStorage initialiserad för namespace: ${namespace}`);
  }

  encrypt(data) {
    try {
      if (data === undefined || data === null) {
        logger.warn('Försök att kryptera null/undefined data');
        return null;
      }
      const jsonString = JSON.stringify(data);
      const encryptedData = CryptoJS.AES.encrypt(jsonString, this.secretKey).toString();
      logger.debug('Data krypterad');
      return encryptedData;
    } catch (error) {
      logger.error('Krypteringsfel:', error);
      return null;
    }
  }

  decrypt(encryptedData) {
    try {
      if (!encryptedData) {
        logger.warn('Försök att dekryptera tom data');
        return null;
      }
      
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedString) {
        logger.warn('Dekryptering resulterade i tom sträng');
        return null;
      }
      
      return JSON.parse(decryptedString);
    } catch (error) {
      logger.error('Dekrypteringsfel:', error);
      return null;
    }
  }

  setItem(key, value) {
    try {
      if (key === undefined || key === null) {
        logger.warn('Försök att spara med tom nyckel');
        return false;
      }
      
      const storageKey = `${this.namespace}_${key}`;
      const encryptedValue = this.encrypt(value);
      
      if (encryptedValue === null) {
        logger.warn('Kryptering misslyckades, inget sparades');
        return false;
      }
      
      localStorage.setItem(storageKey, encryptedValue);
      logger.debug(`Lagrade data för nyckel: ${storageKey}`);
      return true;
    } catch (error) {
      logger.error('Fel vid lagring av data:', error);
      return false;
    }
  }

  getItem(key) {
    try {
      if (key === undefined || key === null) {
        logger.warn('Försök att hämta med tom nyckel');
        return null;
      }
      
      const storageKey = `${this.namespace}_${key}`;
      const encryptedValue = localStorage.getItem(storageKey);
      
      if (!encryptedValue) {
        logger.debug(`Ingen data hittades för nyckel: ${storageKey}`);
        return null;
      }
      
      const decryptedValue = this.decrypt(encryptedValue);
      
      if (decryptedValue === null) {
        logger.warn(`Kunde inte dekryptera data för nyckel: ${storageKey}`);
        // Ta bort korrupt data automatiskt
        localStorage.removeItem(storageKey);
        return null;
      }
      
      logger.debug(`Hämtade data för nyckel: ${storageKey}`);
      return decryptedValue;
    } catch (error) {
      logger.error('Fel vid hämtning av data:', error);
      return null;
    }
  }

  removeItem(key) {
    try {
      const storageKey = `${this.namespace}_${key}`;
      localStorage.removeItem(storageKey);
      logger.debug(`Tog bort data för nyckel: ${storageKey}`);
      return true;
    } catch (error) {
      logger.error('Fel vid borttagning av data:', error);
      return false;
    }
  }

  clear() {
    try {
      const keysToRemove = Object.keys(localStorage)
        .filter(key => key.startsWith(this.namespace));
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      logger.info(`Rensade alla ${keysToRemove.length} nycklar för namespace: ${this.namespace}`);
      return true;
    } catch (error) {
      logger.error('Fel vid rensning av data:', error);
      return false;
    }
  }
}

export default SecureStorage; 