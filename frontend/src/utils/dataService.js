import { getFromCache, saveToCache, CACHE_KEYS } from './cacheManager';

/**
 * Validerar och filtrerar data för att säkerställa unika ID:n
 * @param {Array} data - Data att filtrera
 * @param {string} entityName - Namn på entiteten för loggning
 * @returns {Array} - Filtrerad data med unika ID:n
 */
export const filterUniqueById = (data, entityName) => {
  if (!Array.isArray(data)) {
    console.warn(`Ogiltig data för ${entityName} - inte en array`);
    return [];
  }

  const uniqueIds = new Set();
  const uniqueItems = data.filter(item => {
    if (!item.id || uniqueIds.has(item.id)) {
      console.warn(`Filtrerar bort duplicerat/ogiltigt ${entityName}:`, item);
      return false;
    }
    uniqueIds.add(item.id);
    return true;
  });

  // Logga om vi filtrerade bort objekt
  if (uniqueItems.length !== data.length) {
    console.warn(`Filtrerade bort ${data.length - uniqueItems.length} duplicerade ${entityName}`);
  }

  return uniqueItems;
};

/**
 * Rensar ett ID från prefix
 * @param {string} id - ID att rensa
 * @returns {string} - Rensat ID
 */
export const cleanId = (id) => {
  return id ? id.replace(/^(email-|task-|interest-)/g, '') : id;
};

/**
 * Hämtar data från API med cachestöd och validering
 * @param {string} endpoint - API-endpoint att anropa
 * @param {string} cacheKey - Nyckel för caching
 * @param {boolean} bypassCache - Om true, hämtas data från API oavsett cache
 * @param {string} entityName - Namn på entiteten för loggning
 * @param {Function} apiCall - Funktion för att anropa API
 * @returns {Promise<Array>} - Hämtad och validerad data
 */
export const fetchWithCache = async (
  endpoint,
  cacheKey,
  bypassCache = false,
  entityName = 'item',
  apiCall
) => {
  try {
    // Kontrollera om data finns i cache och vi inte explicit vill gå förbi cachen
    if (!bypassCache) {
      const cachedData = getFromCache(cacheKey);
      if (cachedData) return cachedData;
    }

    // Anropa API
    const response = await apiCall(endpoint);
    
    if (!response.data) {
      console.warn(`Inget svar från API för ${entityName}`);
      return [];
    }

    // Validera och filtrera data
    if (Array.isArray(response.data)) {
      const uniqueItems = filterUniqueById(response.data, entityName);
      
      // Spara den filtrerade datan i cache
      saveToCache(cacheKey, uniqueItems);
      
      return uniqueItems;
    }
    
    // Om vi fick något annat än en array
    saveToCache(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error(`Fel vid hämtning av ${entityName}:`, error);
    return [];
  }
}; 