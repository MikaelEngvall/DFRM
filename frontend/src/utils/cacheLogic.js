import { secureStorage } from './secureStorage';

export const cacheData = (key, data) => {
  const cacheItem = {
    timestamp: Date.now(),
    data: data
  };
  secureStorage.setItem(key, cacheItem);
};

export const getCachedData = (key, maxAge = 300000) => { // 5 minuter som standard
  const cachedItem = secureStorage.getItem(key);
  
  if (!cachedItem) return null;
  
  const now = Date.now();
  if (now - cachedItem.timestamp > maxAge) {
    secureStorage.removeItem(key);
    return null;
  }
  
  return cachedItem.data;
};

export const clearCache = () => {
  secureStorage.clear();
};

export const removeCacheItem = (key) => {
  secureStorage.removeItem(key);
}; 