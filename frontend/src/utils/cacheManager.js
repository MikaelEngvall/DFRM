/**
 * Hanterare för cachning av data i localStorage
 * Används för att minska antalet API-anrop och förbättra prestandan
 */

import SecureStorage from './secureStorage';

// Skapa en instans av SecureStorage för cachehantering
const secureStorage = new SecureStorage('cache');

// Cache-nycklar för olika datatyper
export const CACHE_KEYS = {
  APARTMENTS: 'cached_apartments',
  TENANTS: 'cached_tenants',
  USERS: 'cached_users',
  KEYS: 'cached_keys',
  TASKS: 'cached_tasks',
  PENDING_TASKS: 'cached_pending_tasks',
  UNREVIEWED_COUNT: 'cached_unreviewed_count',
  EMAIL_REPORTS: 'cached_email_reports'
};

// Standardtid innan cache anses vara för gammal (i millisekunder)
// 30 minuter = 30 * 60 * 1000
const DEFAULT_CACHE_TTL = 30 * 60 * 1000;

const CACHE_PREFIX = 'cached_';
const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minuter

export class CacheManager {
  constructor(key, maxAge = DEFAULT_CACHE_TIME) {
    this.cacheKey = `${CACHE_PREFIX}${key}`;
    this.maxAge = maxAge;
  }

  getData() {
    try {
      const cachedData = secureStorage.getItem(this.cacheKey);
      
      if (!cachedData) {
        return null;
      }

      const now = Date.now();
      if (now - cachedData.timestamp > this.maxAge) {
        this.clearCache();
        return null;
      }

      return cachedData.data;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  setData(data) {
    try {
      const cacheObject = {
        timestamp: Date.now(),
        data: data
      };
      
      secureStorage.setItem(this.cacheKey, cacheObject);
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  }

  clearCache() {
    try {
      secureStorage.removeItem(this.cacheKey);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

// Exportera en funktion för att skapa nya cache managers
export const createCacheManager = (key, maxAge) => {
  return new CacheManager(key, maxAge);
};

/**
 * Hämtar data från cache om den finns och är giltig
 * @param {string} cacheKey - Nyckeln för cachen
 * @param {number} ttl - Time-to-live i millisekunder
 * @returns {Array|null} - Data från cachen eller null om den inte finns/utgått
 */
export const getFromCache = (cacheKey, ttl = DEFAULT_CACHE_TTL) => {
  try {
    const cachedItem = secureStorage.getItem(cacheKey);
    if (!cachedItem) return null;

    const now = Date.now();
    if (now - cachedItem.timestamp > ttl) {
      secureStorage.removeItem(cacheKey);
      return null;
    }

    return cachedItem.data;
  } catch (error) {
    console.error('Fel vid läsning från cache:', error);
    return null;
  }
};

/**
 * Sparar data i cache med tidsstämpel
 * @param {string} cacheKey - Nyckeln för cachen
 * @param {Array} data - Data som ska cachas
 */
export const saveToCache = (cacheKey, data) => {
  try {
    const cacheObject = {
      timestamp: Date.now(),
      data
    };
    secureStorage.setItem(cacheKey, cacheObject);
  } catch (error) {
    console.error('Fel vid skrivning till cache:', error);
  }
};

/**
 * Invaliderar (tar bort) en specifik cache
 * @param {string} cacheKey - Nyckeln för cachen som ska invalideras
 */
export const invalidateCache = (cacheKey) => {
  try {
    secureStorage.removeItem(cacheKey);
  } catch (error) {
    console.error('Fel vid invalidering av cache:', error);
  }
};

/**
 * Invaliderar alla cacher relaterade till entitetsdata
 */
export const invalidateAllEntityCaches = () => {
  Object.values(CACHE_KEYS).forEach(key => invalidateCache(key));
};

/**
 * Kontrollerar om det finns en giltig cache för en viss nyckel
 * @param {string} cacheKey - Nyckeln för cachen
 * @param {number} ttl - Time-to-live i millisekunder
 * @returns {boolean} - True om giltig cache finns, annars false
 */
export const hasCachedData = (cacheKey, ttl = DEFAULT_CACHE_TTL) => {
  return getFromCache(cacheKey, ttl) !== null;
}; 