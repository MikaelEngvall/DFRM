import api from './api';
import { getFromCache, saveToCache, addToCache, updateInCache, removeFromCache, CACHE_KEYS } from '../utils/cacheManager';

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
      
      // Spara den nya datan i cache endast om API-anropet lyckades
      if (response.data) {
        saveToCache(CACHE_KEYS.APARTMENTS, response.data);
      }
      
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
        const cachedApartment = cachedApartments.find(apartment => apartment.id === id);
        if (cachedApartment) return cachedApartment;
      }
      
      const response = await api.get(`/api/apartments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching apartment ${id}:`, error);
      throw error;
    }
  },

  // Skapa en ny lägenhet
  createApartment: async (apartmentData) => {
    try {
      // Skapa lägenheten i databasen först
      const response = await api.post('/api/apartments', apartmentData);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera cachen
      if (response.data) {
        addToCache(CACHE_KEYS.APARTMENTS, response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating apartment:', error);
      throw error;
    }
  },

  // Uppdatera en lägenhet
  updateApartment: async (id, apartmentData) => {
    try {
      // Uppdatera i databasen först
      const response = await api.patch(`/api/apartments/${id}`, apartmentData);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera cachen
      if (response.data) {
        updateInCache(CACHE_KEYS.APARTMENTS, id, response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error updating apartment ${id}:`, error);
      throw error;
    }
  },

  // Ta bort en lägenhet
  deleteApartment: async (id) => {
    try {
      // Ta bort från databasen först
      await api.delete(`/api/apartments/${id}`);
      
      // Om borttagningen lyckades, uppdatera cachen
      removeFromCache(CACHE_KEYS.APARTMENTS, id);
    } catch (error) {
      console.error(`Error deleting apartment ${id}:`, error);
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
      // Uppdatera i databasen först
      const response = await api.patch(`/api/apartments/${apartmentId}/tenant/${tenantId}`);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera cachen
      if (response.data) {
        updateInCache(CACHE_KEYS.APARTMENTS, apartmentId, response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error assigning tenant ${tenantId} to apartment ${apartmentId}:`, error);
      throw error;
    }
  },

  // Tilldela en nyckel till en lägenhet
  assignKey: async (apartmentId, keyId) => {
    try {
      // Uppdatera i databasen först
      const response = await api.patch(`/api/apartments/${apartmentId}/key/${keyId}`);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera båda cacherna
      if (response.data) {
        updateInCache(CACHE_KEYS.APARTMENTS, apartmentId, response.data.apartment);
        updateInCache(CACHE_KEYS.KEYS, keyId, response.data.key);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error assigning key ${keyId} to apartment ${apartmentId}:`, error);
      throw error;
    }
  },

  // Ta bort hyresgäst från lägenhet
  removeTenant: async (apartmentId) => {
    try {
      // Uppdatera i databasen först
      const response = await api.delete(`/api/apartments/${apartmentId}/tenant`);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera cachen
      if (response.data) {
        updateInCache(CACHE_KEYS.APARTMENTS, apartmentId, response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error removing tenant from apartment ${apartmentId}:`, error);
      throw error;
    }
  },

  // Ta bort en nyckel från en lägenhet
  removeKey: async (apartmentId, keyId) => {
    try {
      // Uppdatera i databasen först
      const response = await api.delete(`/api/apartments/${apartmentId}/key/${keyId}`);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera båda cacherna
      if (response.data) {
        updateInCache(CACHE_KEYS.APARTMENTS, apartmentId, response.data.apartment);
        updateInCache(CACHE_KEYS.KEYS, keyId, response.data.key);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error removing key ${keyId} from apartment ${apartmentId}:`, error);
      throw error;
    }
  },

  // Partiell uppdatering av en lägenhet (PATCH)
  patchApartment: async (id, patchData) => {
    try {
      // Uppdatera i databasen först
      const response = await api.patch(`/api/apartments/${id}`, patchData);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera cachen
      if (response.data) {
        updateInCache(CACHE_KEYS.APARTMENTS, id, response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error patching apartment ${id}:`, error);
      throw error;
    }
  },
  
  // Exportera lägenheter som SQL
  exportToSql: async () => {
    try {
      const response = await api.get('/api/apartments/export-sql', {
        responseType: 'blob'
      });
      
      // Skapa en URL för blob och ladda ner filen
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'apartments_export.sql');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Error exporting apartments to SQL:', error);
      throw error;
    }
  },
  
  // Alias för bakåtkompatibilitet
  getAll: async (bypassCache = false) => {
    return apartmentService.getAllApartments(bypassCache);
  }
};

export default apartmentService; 