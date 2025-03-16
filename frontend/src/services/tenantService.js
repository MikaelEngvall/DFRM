import api from './api';
import { getFromCache, saveToCache, addToCache, updateInCache, removeFromCache, CACHE_KEYS } from '../utils/cacheManager';

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
      
      // Spara den nya datan i cache endast om API-anropet lyckades
      if (response.data) {
        saveToCache(CACHE_KEYS.TENANTS, response.data);
      }
      
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
      
      const response = await api.get(`/api/tenants/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tenant ${id}:`, error);
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
      // Skapa hyresgästen i databasen först
      const response = await api.post('/api/tenants', tenantData);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera cachen
      if (response.data) {
        addToCache(CACHE_KEYS.TENANTS, response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  },

  // Uppdatera en hyresgäst
  updateTenant: async (id, tenantData) => {
    try {
      // Uppdatera i databasen först
      const response = await api.patch(`/api/tenants/${id}`, tenantData);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera cachen
      if (response.data) {
        updateInCache(CACHE_KEYS.TENANTS, id, response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error updating tenant ${id}:`, error);
      throw error;
    }
  },

  // Partiell uppdatering av en hyresgäst (endast ändrade fält)
  patchTenant: async (id, partialData) => {
    try {
      // Uppdatera i databasen först
      const response = await api.patch(`/api/tenants/${id}`, partialData);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera cachen
      if (response.data) {
        updateInCache(CACHE_KEYS.TENANTS, id, response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error patching tenant ${id}:`, error);
      throw error;
    }
  },

  // Ta bort en hyresgäst
  deleteTenant: async (id) => {
    try {
      // Ta bort från databasen först
      await api.delete(`/api/tenants/${id}`);
      
      // Om borttagningen lyckades, uppdatera cachen
      removeFromCache(CACHE_KEYS.TENANTS, id);
    } catch (error) {
      console.error(`Error deleting tenant ${id}:`, error);
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
      // Uppdatera i databasen först med apartmentId som query parameter
      const response = await api.patch(`/api/tenants/${tenantId}/apartment?apartmentId=${apartmentId}`);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera båda cacherna
      if (response.data) {
        updateInCache(CACHE_KEYS.TENANTS, tenantId, response.data.tenant);
        if (response.data.apartment) {
          updateInCache(CACHE_KEYS.APARTMENTS, apartmentId, response.data.apartment);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error assigning apartment ${apartmentId} to tenant ${tenantId}:`, error);
      // Kasta om felet med mer beskrivande meddelande
      throw new Error(`Failed to assign apartment: ${error.response?.data?.message || error.message}`);
    }
  },

  // Tilldela en nyckel till en hyresgäst
  assignKey: async (tenantId, keyId) => {
    try {
      // Uppdatera i databasen först
      const response = await api.patch(`/api/tenants/${tenantId}/key/${keyId}`);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera båda cacherna
      if (response.data) {
        updateInCache(CACHE_KEYS.TENANTS, tenantId, response.data.tenant);
        updateInCache(CACHE_KEYS.KEYS, keyId, response.data.key);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error assigning key ${keyId} to tenant ${tenantId}:`, error);
      throw error;
    }
  },

  // Ta bort en lägenhet från en hyresgäst
  removeApartment: async (tenantId) => {
    try {
      // Uppdatera i databasen först
      const response = await api.delete(`/api/tenants/${tenantId}/apartment`);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera båda cacherna
      if (response.data) {
        updateInCache(CACHE_KEYS.TENANTS, tenantId, response.data.tenant);
        if (response.data.apartment) {
          updateInCache(CACHE_KEYS.APARTMENTS, response.data.apartment.id, response.data.apartment);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error removing apartment from tenant ${tenantId}:`, error);
      throw error;
    }
  },

  // Ta bort en nyckel från en hyresgäst
  removeKey: async (tenantId, keyId) => {
    try {
      // Uppdatera i databasen först
      const response = await api.delete(`/api/tenants/${tenantId}/key/${keyId}`);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera båda cacherna
      if (response.data) {
        updateInCache(CACHE_KEYS.TENANTS, tenantId, response.data.tenant);
        updateInCache(CACHE_KEYS.KEYS, keyId, response.data.key);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error removing key ${keyId} from tenant ${tenantId}:`, error);
      throw error;
    }
  },

  // Ta bort alla nycklar från en hyresgäst
  removeAllKeys: async (tenantId) => {
    try {
      // Uppdatera i databasen först
      const response = await api.delete(`/api/tenants/${tenantId}/keys`);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera båda cacherna
      if (response.data) {
        updateInCache(CACHE_KEYS.TENANTS, tenantId, response.data.tenant);
        // Uppdatera alla påverkade nycklar i cachen
        response.data.keys.forEach(key => {
          updateInCache(CACHE_KEYS.KEYS, key.id, key);
        });
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error removing all keys from tenant ${tenantId}:`, error);
      throw error;
    }
  },

  // Sök hyresgäster efter namn
  findByName: async (name) => {
    try {
      // Försök hitta i cachen först
      const cachedTenants = getFromCache(CACHE_KEYS.TENANTS);
      if (cachedTenants) {
        const searchName = name.toLowerCase();
        return cachedTenants.filter(tenant => 
          tenant.firstName.toLowerCase().includes(searchName) || 
          tenant.lastName.toLowerCase().includes(searchName)
        );
      }
      
      const response = await api.get(`/api/tenants/search/name/${name}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching tenants by name ${name}:`, error);
      throw error;
    }
  },

  // Sök hyresgäster efter e-post
  findByEmail: async (email) => {
    try {
      // Försök hitta i cachen först
      const cachedTenants = getFromCache(CACHE_KEYS.TENANTS);
      if (cachedTenants) {
        const searchEmail = email.toLowerCase();
        return cachedTenants.filter(tenant => 
          tenant.email.toLowerCase().includes(searchEmail)
        );
      }
      
      const response = await api.get(`/api/tenants/search/email/${email}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching tenants by email ${email}:`, error);
      throw error;
    }
  },
};

export default tenantService; 