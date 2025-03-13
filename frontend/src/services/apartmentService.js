import api from './api';
import { getFromCache, saveToCache, invalidateCache, CACHE_KEYS } from '../utils/cacheManager';

const apartmentService = {
  // Hämta alla lägenheter
  getAllApartments: async (bypassCache = false) => {
    try {
      // Kontrollera om data finns i cache och om vi inte explicit vill gå förbi cachen
      if (!bypassCache) {
        const cachedData = getFromCache(CACHE_KEYS.APARTMENTS);
        if (cachedData) return cachedData;
      }
      
      // Hämta data från API om det inte finns i cache eller om vi vill gå förbi cachen
      const response = await api.get('/api/apartments');
      
      // Spara den nya datan i cache
      saveToCache(CACHE_KEYS.APARTMENTS, response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching apartments:', error);
      throw error;
    }
  },

  // Hämta lägenheter med detaljer om hyresgäster
  getAllApartmentsWithTenants: async () => {
    try {
      // Vi använder samma cache som getAllApartments eftersom båda API-anropen
      // levererar samma data i denna implementation
      const cachedData = getFromCache(CACHE_KEYS.APARTMENTS);
      if (cachedData) return cachedData;
      
      const response = await api.get('/api/apartments');
      saveToCache(CACHE_KEYS.APARTMENTS, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching apartments with tenants:', error);
      throw error;
    }
  },

  // Hämta en specifik lägenhet
  getApartmentById: async (id) => {
    try {
      // Försök hitta lägenheten i cachen först
      const cachedApartments = getFromCache(CACHE_KEYS.APARTMENTS);
      if (cachedApartments) {
        const cachedApartment = cachedApartments.find(apt => apt.id === id);
        if (cachedApartment) return cachedApartment;
      }
      
      // Om den inte finns i cache, hämta från API
      const response = await api.get(`/api/apartments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching apartment with id ${id}:`, error);
      throw error;
    }
  },

  // Skapa en ny lägenhet
  createApartment: async (apartmentData) => {
    try {
      const response = await api.post('/api/apartments', apartmentData);
      
      // Invalidera cachen för lägenheter eftersom vi lagt till en ny
      invalidateCache(CACHE_KEYS.APARTMENTS);
      
      return response.data;
    } catch (error) {
      console.error('Error creating apartment:', error);
      throw error;
    }
  },

  // Uppdatera en lägenhet
  updateApartment: async (id, apartmentData) => {
    try {
      const response = await api.put(`/api/apartments/${id}`, apartmentData);
      
      // Invalidera cachen för lägenheter eftersom vi uppdaterat en
      invalidateCache(CACHE_KEYS.APARTMENTS);
      
      return response.data;
    } catch (error) {
      console.error(`Error updating apartment with id ${id}:`, error);
      throw error;
    }
  },

  // Ta bort en lägenhet
  deleteApartment: async (id) => {
    try {
      await api.delete(`/api/apartments/${id}`);
      
      // Invalidera cachen för lägenheter eftersom vi tagit bort en
      invalidateCache(CACHE_KEYS.APARTMENTS);
      
    } catch (error) {
      console.error(`Error deleting apartment with id ${id}:`, error);
      throw error;
    }
  },

  // Sök lägenheter efter stad
  findByCity: async (city) => {
    const response = await api.get(`/api/apartments/search/city/${city}`);
    return response.data;
  },

  // Sök lägenheter efter minsta antal rum
  findByRooms: async (minRooms) => {
    const response = await api.get(`/api/apartments/search/rooms/${minRooms}`);
    return response.data;
  },

  // Sök lägenheter efter maxpris
  findByPrice: async (maxPrice) => {
    const response = await api.get(`/api/apartments/search/price/${maxPrice}`);
    return response.data;
  },

  // Sök lägenheter efter adress
  findByAddress: async (street, number, apartmentNumber) => {
    try {
      const response = await api.get(`/api/apartments/search/address?street=${street}&number=${number}&apartmentNumber=${apartmentNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error searching apartments by address:', error);
      throw error;
    }
  },

  // Tilldela en hyresgäst till en lägenhet
  assignTenant: async (apartmentId, tenantId) => {
    try {
      const response = await api.patch(`/api/apartments/${apartmentId}/tenant?tenantId=${tenantId}`);
      
      // Invalidera både lägenhet- och hyresgästcache eftersom relationen har ändrats
      invalidateCache(CACHE_KEYS.APARTMENTS);
      invalidateCache(CACHE_KEYS.TENANTS);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tilldela en nyckel till en lägenhet
  assignKey: async (apartmentId, keyId) => {
    try {
      const response = await api.patch(`/api/apartments/${apartmentId}/key?keyId=${keyId}`);
      
      // Invalidera både lägenhet- och nyckelcache
      invalidateCache(CACHE_KEYS.APARTMENTS);
      invalidateCache(CACHE_KEYS.KEYS);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Ta bort en hyresgäst från en lägenhet
  removeTenant: async (apartmentId, tenantId) => {
    const response = await api.delete(`/api/apartments/${apartmentId}/tenant/${tenantId}`);
    
    // Invalidera både lägenhet- och hyresgästcache
    invalidateCache(CACHE_KEYS.APARTMENTS);
    invalidateCache(CACHE_KEYS.TENANTS);
    
    return response.data;
  },

  // Ta bort en nyckel från en lägenhet
  removeKey: async (apartmentId, keyId) => {
    const response = await api.delete(`/api/apartments/${apartmentId}/key/${keyId}`);
    
    // Invalidera både lägenhet- och nyckelcache
    invalidateCache(CACHE_KEYS.APARTMENTS);
    invalidateCache(CACHE_KEYS.KEYS);
    
    return response.data;
  },

  // Partiell uppdatering av en lägenhet (PATCH)
  patchApartment: async (id, patchData) => {
    try {
      const response = await api.patch(`/api/apartments/${id}`, patchData);
      
      // Invalidera cachen för lägenheter eftersom vi uppdaterat en
      invalidateCache(CACHE_KEYS.APARTMENTS);
      
      return response.data;
    } catch (error) {
      console.error(`Error patching apartment with id ${id}:`, error);
      throw error;
    }
  },
};

export default apartmentService; 