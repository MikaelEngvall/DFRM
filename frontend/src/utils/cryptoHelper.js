/**
 * Hjälpfunktioner för att kryptera och dekryptera data i localStorage
 */

// Generera en unik nyckel baserat på webbläsarinformation
const generateKey = () => {
  // Använd navigatorinformation för att skapa en unik nyckel för denna webbläsare
  // Detta hjälper till att göra krypteringen unik för varje användare/enhet
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const language = navigator.language;
  
  // Skapa en hash av användarspecifik data
  let hash = 0;
  const combinedString = `${userAgent}${platform}${language}DFRM_SECRET_KEY`;
  
  for (let i = 0; i < combinedString.length; i++) {
    const char = combinedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Konvertera till 32-bitars heltal
  }
  
  // Konvertera hash till en sträng och använd som nyckel
  return hash.toString(36);
};

// Cache för krypteringsnyckeln
let _encryptionKey = null;

// Få krypteringsnyckeln - skapar en om den inte finns
const getEncryptionKey = () => {
  if (!_encryptionKey) {
    _encryptionKey = generateKey();
  }
  return _encryptionKey;
};

/**
 * Enkel XOR-kryptering för data
 * 
 * @param {string} data - Data som ska krypteras/dekrypteras
 * @param {string} key - Nyckeln som används för kryptering/dekryptering
 * @returns {string} - Krypterad/dekrypterad data
 */
const xorEncryptDecrypt = (data, key) => {
  let result = '';
  
  for (let i = 0; i < data.length; i++) {
    // XOR varje tecken med motsvarande tecken i nyckeln (loopar nyckeln)
    const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  
  return result;
};

/**
 * Krypterar data för säker lagring
 * 
 * @param {any} data - Data som ska krypteras (konverteras till JSON först)
 * @returns {string} - Krypterad data i Base64-format
 */
export const encryptData = (data) => {
  try {
    // Konvertera data till JSON-sträng
    const jsonData = JSON.stringify(data);
    
    // Kryptera data med XOR
    const encryptedData = xorEncryptDecrypt(jsonData, getEncryptionKey());
    
    // Konvertera till Base64 för säker lagring
    return btoa(encryptedData);
  } catch (error) {
    console.error('Error encrypting data:', error);
    return null;
  }
};

/**
 * Dekrypterar data från säker lagring
 * 
 * @param {string} encryptedData - Krypterad data i Base64-format
 * @returns {any} - Dekrypterad data, parsed från JSON
 */
export const decryptData = (encryptedData) => {
  try {
    // Dekryptera från Base64
    const base64Data = atob(encryptedData);
    
    // Dekryptera data med XOR
    const decryptedData = xorEncryptDecrypt(base64Data, getEncryptionKey());
    
    // Parsa från JSON
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Error decrypting data:', error);
    return null;
  }
};

/**
 * Säker lokal lagring med kryptering
 */
export const secureStorage = {
  /**
   * Spara data säkert i localStorage
   * 
   * @param {string} key - Nyckel för lagring
   * @param {any} value - Värdet som ska lagras
   */
  setItem: (key, value) => {
    const encryptedValue = encryptData(value);
    localStorage.setItem(key, encryptedValue);
  },
  
  /**
   * Hämta dekrypterad data från localStorage
   * 
   * @param {string} key - Nyckel för lagring
   * @returns {any} - Dekrypterad data
   */
  getItem: (key) => {
    const encryptedValue = localStorage.getItem(key);
    if (!encryptedValue) return null;
    return decryptData(encryptedValue);
  },
  
  /**
   * Ta bort data från localStorage
   * 
   * @param {string} key - Nyckel att ta bort
   */
  removeItem: (key) => {
    localStorage.removeItem(key);
  },
  
  /**
   * Rensa all data från localStorage
   */
  clear: () => {
    localStorage.clear();
  }
}; 