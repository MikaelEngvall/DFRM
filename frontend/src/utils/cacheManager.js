/**
 * Hanterare för cachning av data i localStorage
 * Används för att minska antalet API-anrop och förbättra prestandan
 */

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

/**
 * Hämtar data från cache om den finns och är giltig
 * @param {string} cacheKey - Nyckeln för cachen
 * @param {number} ttl - Time-to-live i millisekunder
 * @returns {Array|null} - Data från cachen eller null om den inte finns/utgått
 */
export const getFromCache = (cacheKey, ttl = DEFAULT_CACHE_TTL) => {
  try {
    const cachedData = localStorage.getItem(cacheKey);
    
    if (!cachedData) return null;
    
    const { timestamp, data } = JSON.parse(cachedData);
    const now = new Date().getTime();
    
    // Kontrollera om cachen är för gammal
    if (now - timestamp > ttl) {
      console.log(`Cache för ${cacheKey} har utgått`);
      return null;
    }
    
    console.log(`Använder cachad data för ${cacheKey}`);
    return data;
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
      timestamp: new Date().getTime(),
      data
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheObject));
    console.log(`Data sparad i cache för ${cacheKey}`);
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
    localStorage.removeItem(cacheKey);
    console.log(`Cache invaliderad för ${cacheKey}`);
  } catch (error) {
    console.error('Fel vid invalidering av cache:', error);
  }
};

/**
 * Invaliderar alla cacher relaterade till entitetsdata
 */
export const invalidateAllEntityCaches = () => {
  Object.values(CACHE_KEYS).forEach(key => invalidateCache(key));
  console.log('Alla entitetscacher har invaliderats');
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