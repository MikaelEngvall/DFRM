import api from './api';
import { getFromCache, saveToCache, invalidateCache, CACHE_KEYS } from '../utils/cacheManager';

const keyService = {
  // Hämta alla nycklar
  getAllKeys: async (bypassCache = false) => {
    try {
      // Kontrollera om data finns i cache och om vi inte explicit vill gå förbi cachen
      if (!bypassCache) {
        const cachedData = getFromCache(CACHE_KEYS.KEYS);
        if (cachedData) return cachedData;
      }
      
      // Hämta data från API om det inte finns i cache eller om vi vill gå förbi cachen
      const response = await api.get('/api/keys');
      
      // Spara den nya datan i cache
      saveToCache(CACHE_KEYS.KEYS, response.data);
      
      return response.data;
    } catch (error) {
      console.error('Fel vid hämtning av nycklar:', error);
      throw error;
    }
  },

  // Hämta en specifik nyckel
  getKeyById: async (id) => {
    try {
      // Försök hitta nyckeln i cachen först
      const cachedKeys = getFromCache(CACHE_KEYS.KEYS);
      if (cachedKeys) {
        const cachedKey = cachedKeys.find(key => key.id === id);
        if (cachedKey) return cachedKey;
      }
      
      // Om den inte finns i cache, hämta från API
      const response = await api.get(`/api/keys/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Fel vid hämtning av nyckel ${id}:`, error);
      throw error;
    }
  },

  // Hämta nyckel via serie och nummer
  findBySerieAndNumber: async (serie, number) => {
    try {
      // Försök hitta nyckeln i cachen först baserat på serie och nummer
      const cachedKeys = getFromCache(CACHE_KEYS.KEYS);
      if (cachedKeys) {
        const cachedKey = cachedKeys.find(key => key.serie === serie && key.number === number);
        if (cachedKey) return cachedKey;
      }
      
      // Om den inte finns i cache, hämta från API
      const response = await api.get('/api/keys/search', {
        params: { serie, number },
      });
      return response.data;
    } catch (error) {
      console.error(`Fel vid sökning av nyckel (serie: ${serie}, nummer: ${number}):`, error);
      throw error;
    }
  },

  // Skapa en ny nyckel
  createKey: async (keyData) => {
    try {
      console.log('Anropar API: POST /api/keys med data:', keyData);
      const response = await api.post('/api/keys', keyData);
      
      // Invalidera cachen för nycklar eftersom vi lagt till en ny
      invalidateCache(CACHE_KEYS.KEYS);
      
      console.log('Svar från createKey:', response.data);
      return response.data;
    } catch (error) {
      console.error('Fel vid skapande av nyckel:', error);
      throw error;
    }
  },

  // Uppdatera en nyckel (fullständig ersättning)
  updateKey: async (id, keyData) => {
    try {
      const response = await api.patch(`/api/keys/${id}`, keyData);
      
      // Invalidera cachen för nycklar eftersom vi uppdaterat en
      invalidateCache(CACHE_KEYS.KEYS);
      
      return response.data;
    } catch (error) {
      console.error(`Error updating key with ID ${id}:`, error);
      throw error;
    }
  },

  // Partiell uppdatering av en nyckel (endast ändrade fält)
  patchKey: async (id, partialData) => {
    try {
      const response = await api.patch(`/api/keys/${id}`, partialData);
      
      // Invalidera cachen för nycklar eftersom vi uppdaterat en
      invalidateCache(CACHE_KEYS.KEYS);
      
      return response.data;
    } catch (error) {
      console.error(`Error patching key with ID ${id}:`, error);
      throw error;
    }
  },

  // Ta bort en nyckel
  deleteKey: async (id) => {
    try {
      console.log(`Anropar API: DELETE /api/keys/${id}`);
      const response = await api.delete(`/api/keys/${id}`);
      
      // Invalidera cachen för nycklar eftersom vi tagit bort en
      invalidateCache(CACHE_KEYS.KEYS);
      
      console.log('Nyckel borttagen');
      return response.data;
    } catch (error) {
      console.error(`Fel vid borttagning av nyckel ${id}:`, error);
      throw error;
    }
  },

  // Sök nycklar efter typ
  findByType: async (type) => {
    const response = await api.get(`/api/keys/search/type/${type}`);
    return response.data;
  },

  // Hämta nycklar för en specifik lägenhet
  findByApartmentId: async (apartmentId) => {
    const response = await api.get(`/api/keys/search/apartment/${apartmentId}`);
    return response.data;
  },

  // Hämta nycklar för en specifik hyresgäst
  findByTenantId: async (tenantId) => {
    const response = await api.get(`/api/keys/search/tenant/${tenantId}`);
    return response.data;
  },

  // Tilldela en lägenhet till en nyckel
  assignApartment: async (keyId, apartmentId) => {
    try {
      console.log(`Försöker tilldela lägenhet ${apartmentId} till nyckel ${keyId} med PATCH`);
      try {
        const response = await api.patch(`/api/keys/${keyId}/apartment?apartmentId=${apartmentId}`);
        
        // Invalidera både nyckel- och lägenhetcache eftersom relationen har ändrats
        invalidateCache(CACHE_KEYS.KEYS);
        invalidateCache(CACHE_KEYS.APARTMENTS);
        
        console.log('Framgångsrik tilldelning med PATCH');
        return response.data;
      } catch (patchError) {
        // Om PATCH misslyckas med 403, försök med PUT istället
        if (patchError.response && patchError.response.status === 403) {
          console.log('PATCH misslyckades med 403, försöker med PUT istället');
          const putResponse = await api.put(`/api/keys/${keyId}/apartment?apartmentId=${apartmentId}`);
          
          // Invalidera både nyckel- och lägenhetcache eftersom relationen har ändrats
          invalidateCache(CACHE_KEYS.KEYS);
          invalidateCache(CACHE_KEYS.APARTMENTS);
          
          console.log('Framgångsrik tilldelning med PUT som fallback');
          return putResponse.data;
        } else {
          // Om det inte är ett 403-fel, kasta felet vidare
          throw patchError;
        }
      }
    } catch (error) {
      console.error(`Error assigning key ${keyId} to apartment ${apartmentId}:`, error);
      throw error;
    }
  },

  // Tilldela en hyresgäst till en nyckel
  assignTenant: async (keyId, tenantId) => {
    try {
      console.log(`Försöker tilldela hyresgäst ${tenantId} till nyckel ${keyId} med PATCH`);
      try {
        const response = await api.patch(`/api/keys/${keyId}/tenant?tenantId=${tenantId}`);
        
        // Invalidera både nyckel- och hyresgästcache eftersom relationen har ändrats
        invalidateCache(CACHE_KEYS.KEYS);
        invalidateCache(CACHE_KEYS.TENANTS);
        
        console.log('Framgångsrik tilldelning med PATCH');
        return response.data;
      } catch (patchError) {
        // Om PATCH misslyckas med 403, försök med PUT istället
        if (patchError.response && patchError.response.status === 403) {
          console.log('PATCH misslyckades med 403, försöker med PUT istället');
          const putResponse = await api.put(`/api/keys/${keyId}/tenant?tenantId=${tenantId}`);
          
          // Invalidera både nyckel- och hyresgästcache eftersom relationen har ändrats
          invalidateCache(CACHE_KEYS.KEYS);
          invalidateCache(CACHE_KEYS.TENANTS);
          
          console.log('Framgångsrik tilldelning med PUT som fallback');
          return putResponse.data;
        } else {
          // Om det inte är ett 403-fel, kasta felet vidare
          throw patchError;
        }
      }
    } catch (error) {
      console.error(`Error assigning key ${keyId} to tenant ${tenantId}:`, error);
      throw error;
    }
  },

  // Ta bort lägenhet från en nyckel
  removeApartment: async (keyId) => {
    try {
      console.log(`Anropar API: DELETE /api/keys/${keyId}/apartment`);
      const response = await api.delete(`/api/keys/${keyId}/apartment`);
      
      // Invalidera både nyckel- och lägenhetcache eftersom relationen har ändrats
      invalidateCache(CACHE_KEYS.KEYS);
      invalidateCache(CACHE_KEYS.APARTMENTS);
      
      console.log('Svar från removeApartment:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Fel vid borttagning av lägenhet från nyckel ${keyId}:`, error);
      throw error;
    }
  },

  // Ta bort hyresgäst från en nyckel
  removeTenant: async (keyId) => {
    try {
      console.log(`Anropar API: DELETE /api/keys/${keyId}/tenant`);
      const response = await api.delete(`/api/keys/${keyId}/tenant`);
      
      // Invalidera både nyckel- och hyresgästcache eftersom relationen har ändrats
      invalidateCache(CACHE_KEYS.KEYS);
      invalidateCache(CACHE_KEYS.TENANTS);
      
      console.log('Svar från removeTenant:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Fel vid borttagning av hyresgäst från nyckel ${keyId}:`, error);
      throw error;
    }
  },
};

export default keyService; 