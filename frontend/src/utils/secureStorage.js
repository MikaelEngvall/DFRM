import CryptoJS from 'crypto-js';

class SecureStorage {
  constructor(storageKey = 'secure_storage_key') {
    this.storageKey = storageKey;
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
    const encryptedValue = this.encrypt(value);
    localStorage.setItem(`${this.storageKey}_${key}`, encryptedValue);
  }

  getItem(key) {
    const encryptedValue = localStorage.getItem(`${this.storageKey}_${key}`);
    if (!encryptedValue) return null;
    return this.decrypt(encryptedValue);
  }

  removeItem(key) {
    localStorage.removeItem(`${this.storageKey}_${key}`);
  }

  clear() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.storageKey))
      .forEach(key => localStorage.removeItem(key));
  }
}

export const secureStorage = new SecureStorage(); 