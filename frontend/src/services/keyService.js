import api from './api';

const keyService = {
  // Hämta alla nycklar
  getAllKeys: async () => {
    try {
      console.log('Anropar API: GET /api/keys');
      const response = await api.get('/api/keys');
      console.log('Svar från getAllKeys:', response.data);
      return response.data;
    } catch (error) {
      console.error('Fel vid hämtning av nycklar:', error);
      throw error;
    }
  },

  // Hämta en specifik nyckel
  getKeyById: async (id) => {
    try {
      console.log(`Anropar API: GET /api/keys/${id}`);
      const response = await api.get(`/api/keys/${id}`);
      console.log('Svar från getKeyById:', response.data);
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

  // Uppdatera en nyckel
  updateKey: async (id, keyData) => {
    try {
      console.log(`Anropar API: PUT /api/keys/${id} med data:`, keyData);
      const { apartmentId, tenantId, ...rest } = keyData;
      const response = await api.put(`/api/keys/${id}`, rest);
      console.log('Svar från updateKey:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Fel vid uppdatering av nyckel ${id}:`, error);
      throw error;
    }
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
      console.log(`Anropar API: PUT /api/keys/${keyId}/apartment?apartmentId=${apartmentId}`);
      const response = await api.put(`/api/keys/${keyId}/apartment?apartmentId=${apartmentId}`);
      console.log('Svar från assignApartment:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Fel vid tilldelning av lägenhet ${apartmentId} till nyckel ${keyId}:`, error);
      throw error;
    }
  },

  // Tilldela en hyresgäst till en nyckel
  assignTenant: async (keyId, tenantId) => {
    try {
      console.log(`Anropar API: PUT /api/keys/${keyId}/tenant?tenantId=${tenantId}`);
      const response = await api.put(`/api/keys/${keyId}/tenant?tenantId=${tenantId}`);
      console.log('Svar från assignTenant:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Fel vid tilldelning av hyresgäst ${tenantId} till nyckel ${keyId}:`, error);
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