import api from './api';
import { getFromCache, saveToCache, addToCache, updateInCache, removeFromCache, CACHE_KEYS } from '../utils/cacheManager';

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
      
      // Spara den nya datan i cache endast om API-anropet lyckades
      if (response.data) {
        saveToCache(CACHE_KEYS.KEYS, response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching keys:', error);
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
      
      const response = await api.get(`/api/keys/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching key ${id}:`, error);
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
      // Skapa nyckeln i databasen först
      const response = await api.post('/api/keys', keyData);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera cachen
      if (response.data) {
        addToCache(CACHE_KEYS.KEYS, response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating key:', error);
      throw error;
    }
  },

  // Uppdatera en nyckel
  updateKey: async (id, keyData) => {
    try {
      // Uppdatera i databasen först
      const response = await api.patch(`/api/keys/${id}`, keyData);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera cachen
      if (response.data) {
        updateInCache(CACHE_KEYS.KEYS, id, response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error updating key ${id}:`, error);
      throw error;
    }
  },

  // Partiell uppdatering av en nyckel (endast ändrade fält)
  patchKey: async (id, partialData) => {
    try {
      const response = await api.patch(`/api/keys/${id}`, partialData);
      
      // Invalidera cachen för nycklar eftersom vi uppdaterat en
      removeFromCache(CACHE_KEYS.KEYS, id);
      
      return response.data;
    } catch (error) {
      console.error(`Error patching key with ID ${id}:`, error);
      throw error;
    }
  },

  // Ta bort en nyckel
  deleteKey: async (id) => {
    try {
      // Ta bort från databasen först
      await api.delete(`/api/keys/${id}`);
      
      // Om borttagningen lyckades, uppdatera cachen
      removeFromCache(CACHE_KEYS.KEYS, id);
    } catch (error) {
      console.error(`Error deleting key ${id}:`, error);
      throw error;
    }
  },

  // Sök nycklar efter status
  findByStatus: async (status) => {
    try {
      // Försök hitta i cachen först
      const cachedKeys = getFromCache(CACHE_KEYS.KEYS);
      if (cachedKeys) {
        return cachedKeys.filter(key => key.status === status);
      }
      
      const response = await api.get(`/api/keys/search/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching keys by status ${status}:`, error);
      throw error;
    }
  },

  // Sök nycklar efter typ
  findByType: async (type) => {
    try {
      // Försök hitta i cachen först
      const cachedKeys = getFromCache(CACHE_KEYS.KEYS);
      if (cachedKeys) {
        return cachedKeys.filter(key => key.type === type);
      }
      
      const response = await api.get(`/api/keys/search/type/${type}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching keys by type ${type}:`, error);
      throw error;
    }
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

  // Tilldela en nyckel till en lägenhet
  assignToApartment: async (keyId, apartmentId) => {
    try {
      // Uppdatera i databasen först
      const response = await api.patch(`/api/keys/${keyId}/apartment/${apartmentId}`);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera båda cacherna
      if (response.data) {
        updateInCache(CACHE_KEYS.KEYS, keyId, response.data.key);
        updateInCache(CACHE_KEYS.APARTMENTS, apartmentId, response.data.apartment);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error assigning key ${keyId} to apartment ${apartmentId}:`, error);
      throw error;
    }
  },

  // Tilldela en nyckel till en hyresgäst
  assignToTenant: async (keyId, tenantId) => {
    try {
      // Uppdatera i databasen först
      const response = await api.patch(`/api/keys/${keyId}/tenant/${tenantId}`);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera båda cacherna
      if (response.data) {
        updateInCache(CACHE_KEYS.KEYS, keyId, response.data.key);
        updateInCache(CACHE_KEYS.TENANTS, tenantId, response.data.tenant);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error assigning key ${keyId} to tenant ${tenantId}:`, error);
      throw error;
    }
  },

  // Ta bort en nyckel från en lägenhet
  removeFromApartment: async (keyId) => {
    try {
      // Uppdatera i databasen först
      const response = await api.delete(`/api/keys/${keyId}/apartment`);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera båda cacherna
      if (response.data) {
        updateInCache(CACHE_KEYS.KEYS, keyId, response.data.key);
        if (response.data.apartment) {
          updateInCache(CACHE_KEYS.APARTMENTS, response.data.apartment.id, response.data.apartment);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error removing key ${keyId} from apartment:`, error);
      throw error;
    }
  },

  // Ta bort en nyckel från en hyresgäst
  removeFromTenant: async (keyId) => {
    try {
      // Uppdatera i databasen först
      const response = await api.delete(`/api/keys/${keyId}/tenant`);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera båda cacherna
      if (response.data) {
        updateInCache(CACHE_KEYS.KEYS, keyId, response.data.key);
        if (response.data.tenant) {
          updateInCache(CACHE_KEYS.TENANTS, response.data.tenant.id, response.data.tenant);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error removing key ${keyId} from tenant:`, error);
      throw error;
    }
  },

  // Exportera nycklar som SQL
  exportToSql: async () => {
    try {
      const response = await api.get('/api/keys/export-sql', {
        responseType: 'blob'
      });
      
      // Skapa en URL för blob och ladda ner filen
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'keys_export.sql');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Error exporting keys to SQL:', error);
      throw error;
    }
  },
};

export default keyService; 