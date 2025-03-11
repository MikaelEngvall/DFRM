import api from './api';

const keyService = {
  // Hämta alla nycklar
  getAllKeys: async () => {
    try {
      const response = await api.get('/api/keys');
      return response.data;
    } catch (error) {
      console.error('Fel vid hämtning av nycklar:', error);
      throw error;
    }
  },

  // Hämta en specifik nyckel
  getKeyById: async (id) => {
    try {
      const response = await api.get(`/api/keys/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Fel vid hämtning av nyckel ${id}:`, error);
      throw error;
    }
  },

  // Hämta nyckel via serie och nummer
  findBySerieAndNumber: async (serie, number) => {
    const response = await api.get('/api/keys/search', {
      params: { serie, number },
    });
    return response.data;
  },

  // Skapa en ny nyckel
  createKey: async (keyData) => {
    try {
      console.log('Anropar API: POST /api/keys med data:', keyData);
      const response = await api.post('/api/keys', keyData);
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
      return response.data;
    } catch (error) {
      console.error(`Error updating key with ID ${id}:`, error);
      throw error;
    }
  },

  // Partiell uppdatering av en nyckel (endast ändrade fält)
  patchKey: async (id, partialData) => {
    const response = await api.patch(`/api/keys/${id}`, partialData);
    return response.data;
  },

  // Ta bort en nyckel
  deleteKey: async (id) => {
    try {
      console.log(`Anropar API: DELETE /api/keys/${id}`);
      const response = await api.delete(`/api/keys/${id}`);
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
      const response = await api.patch(`/api/keys/${keyId}/apartment?apartmentId=${apartmentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error assigning key ${keyId} to apartment ${apartmentId}:`, error);
      throw error;
    }
  },

  // Tilldela en hyresgäst till en nyckel
  assignTenant: async (keyId, tenantId) => {
    try {
      const response = await api.patch(`/api/keys/${keyId}/tenant?tenantId=${tenantId}`);
      return response.data;
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
      console.log('Svar från removeTenant:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Fel vid borttagning av hyresgäst från nyckel ${keyId}:`, error);
      throw error;
    }
  },
};

export default keyService; 