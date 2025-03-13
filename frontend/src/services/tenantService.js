import api from './api';
import { getFromCache, saveToCache, invalidateCache, CACHE_KEYS } from '../utils/cacheManager';

const tenantService = {
  // Hämta alla hyresgäster
  getAllTenants: async (bypassCache = false) => {
    try {
      // Kontrollera om data finns i cache och om vi inte explicit vill gå förbi cachen
      if (!bypassCache) {
        const cachedData = getFromCache(CACHE_KEYS.TENANTS);
        if (cachedData) return cachedData;
      }
      
      // Hämta data från API om det inte finns i cache eller om vi vill gå förbi cachen
      const response = await api.get('/api/tenants');
      
      // Spara den nya datan i cache
      saveToCache(CACHE_KEYS.TENANTS, response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
  },

  // Hämta en specifik hyresgäst
  getTenantById: async (id) => {
    try {
      // Försök hitta hyresgästen i cachen först
      const cachedTenants = getFromCache(CACHE_KEYS.TENANTS);
      if (cachedTenants) {
        const cachedTenant = cachedTenants.find(tenant => tenant.id === id);
        if (cachedTenant) return cachedTenant;
      }
      
      // Om den inte finns i cache, hämta från API
      const response = await api.get(`/api/tenants/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tenant with ID ${id}:`, error);
      throw error;
    }
  },

  // Hämta hyresgäst via personnummer
  getTenantByPersonnummer: async (personnummer) => {
    try {
      // Försök hitta hyresgästen i cachen först via personnummer
      const cachedTenants = getFromCache(CACHE_KEYS.TENANTS);
      if (cachedTenants) {
        const cachedTenant = cachedTenants.find(tenant => tenant.personnummer === personnummer);
        if (cachedTenant) return cachedTenant;
      }
      
      // Om den inte finns i cache, hämta från API
      const response = await api.get(`/api/tenants/personnummer/${personnummer}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tenant with personnummer ${personnummer}:`, error);
      throw error;
    }
  },

  // Skapa en ny hyresgäst
  createTenant: async (tenantData) => {
    try {
      const response = await api.post('/api/tenants', tenantData);
      
      // Invalidera cachen för hyresgäster eftersom vi lagt till en ny
      invalidateCache(CACHE_KEYS.TENANTS);
      
      return response.data;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  },

  // Uppdatera en hyresgäst (fullständig ersättning)
  updateTenant: async (id, tenantData) => {
    try {
      const response = await api.patch(`/api/tenants/${id}`, tenantData);
      
      // Invalidera cachen för hyresgäster eftersom vi uppdaterat en
      invalidateCache(CACHE_KEYS.TENANTS);
      
      return response.data;
    } catch (error) {
      console.error(`Error updating tenant with ID ${id}:`, error);
      throw error;
    }
  },

  // Partiell uppdatering av en hyresgäst (endast ändrade fält)
  patchTenant: async (id, partialData) => {
    try {
      const response = await api.patch(`/api/tenants/${id}`, partialData);
      
      // Invalidera cachen för hyresgäster eftersom vi uppdaterat en
      invalidateCache(CACHE_KEYS.TENANTS);
      
      return response.data;
    } catch (error) {
      console.error(`Error patching tenant with ID ${id}:`, error);
      throw error;
    }
  },

  // Ta bort en hyresgäst
  deleteTenant: async (id) => {
    try {
      const response = await api.delete(`/api/tenants/${id}`);
      
      // Invalidera cachen för hyresgäster eftersom vi tagit bort en
      invalidateCache(CACHE_KEYS.TENANTS);
      
      return response.data;
    } catch (error) {
      console.error(`Error deleting tenant with ID ${id}:`, error);
      throw error;
    }
  },

  // Sök hyresgäster efter efternamn
  findByLastName: async (lastName) => {
    const response = await api.get(`/api/tenants/search/lastname/${lastName}`);
    return response.data;
  },

  // Sök hyresgäster efter inflyttningsdatum
  findByMovedInDateBetween: async (startDate, endDate) => {
    const response = await api.get('/api/tenants/search/movedin', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Hämta uppsagda hyresgäster
  findTenantsWithResiliated: async () => {
    const response = await api.get('/api/tenants/search/resiliated');
    return response.data;
  },

  // Tilldela en lägenhet till en hyresgäst
  assignApartment: async (tenantId, apartmentId) => {
    try {
      const response = await api.patch(`/api/tenants/${tenantId}/apartment?apartmentId=${apartmentId}`);
      
      // Invalidera både hyresgäst- och lägenhetcache eftersom relationen har ändrats
      invalidateCache(CACHE_KEYS.TENANTS);
      invalidateCache(CACHE_KEYS.APARTMENTS);
      
      return response.data;
    } catch (error) {
      console.error(`Error assigning tenant ${tenantId} to apartment ${apartmentId}:`, error);
      throw error;
    }
  },

  // Tilldela en nyckel till en hyresgäst
  assignKey: async (tenantId, keyId) => {
    try {
      const response = await api.patch(`/api/tenants/${tenantId}/key?keyId=${keyId}`);
      
      // Invalidera både hyresgäst- och nyckelcache
      invalidateCache(CACHE_KEYS.TENANTS);
      invalidateCache(CACHE_KEYS.KEYS);
      
      return response.data;
    } catch (error) {
      console.error(`Error assigning tenant ${tenantId} to key ${keyId}:`, error);
      throw error;
    }
  },

  // Ta bort lägenhet från en hyresgäst
  removeApartment: async (tenantId) => {
    const response = await api.delete(`/api/tenants/${tenantId}/apartment`);
    
    // Invalidera både hyresgäst- och lägenhetcache
    invalidateCache(CACHE_KEYS.TENANTS);
    invalidateCache(CACHE_KEYS.APARTMENTS);
    
    return response.data;
  },

  // Ta bort en specifik nyckel från en hyresgäst
  removeKey: async (tenantId, keyId) => {
    const response = await api.delete(`/api/tenants/${tenantId}/key/${keyId}`);
    
    // Invalidera både hyresgäst- och nyckelcache
    invalidateCache(CACHE_KEYS.TENANTS);
    invalidateCache(CACHE_KEYS.KEYS);
    
    return response.data;
  },

  // Ta bort alla nycklar från en hyresgäst
  removeAllKeys: async (tenantId) => {
    const response = await api.delete(`/api/tenants/${tenantId}/keys`);
    
    // Invalidera både hyresgäst- och nyckelcache
    invalidateCache(CACHE_KEYS.TENANTS);
    invalidateCache(CACHE_KEYS.KEYS);
    
    return response.data;
  },
};

export default tenantService; 