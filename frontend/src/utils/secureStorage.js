import CryptoJS from 'crypto-js';

class SecureStorage {
  constructor(namespace) {
    this.namespace = namespace;
    this.secretKey = process.env.REACT_APP_STORAGE_KEY || 'default-secret-key-change-in-production';
  }

  encrypt(data) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.secretKey).toString();
  }

  decrypt(encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      return null;
    }
  }

  setItem(key, value) {
    try {
      const storageKey = `${this.namespace}_${key}`;
      const encryptedValue = this.encrypt(value);
      localStorage.setItem(storageKey, encryptedValue);
    } catch (error) {
      console.error('Fel vid kryptering och sparande av data:', error);
    }
  }

  getItem(key) {
    try {
      const storageKey = `${this.namespace}_${key}`;
      const encryptedValue = localStorage.getItem(storageKey);
      if (!encryptedValue) return null;
      return this.decrypt(encryptedValue);
    } catch (error) {
      console.error('Fel vid dekryptering av data:', error);
      return null;
    }
  }

  removeItem(key) {
    const storageKey = `${this.namespace}_${key}`;
    localStorage.removeItem(storageKey);
  }

  clear() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.namespace))
      .forEach(key => localStorage.removeItem(key));
  }
}

export default SecureStorage; 