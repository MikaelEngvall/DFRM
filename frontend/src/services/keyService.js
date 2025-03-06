import api from './api';

const keyService = {
  // Hämta alla nycklar
  getAllKeys: async () => {
    const response = await api.get('/keys');
    return response.data;
  },

  // Hämta en specifik nyckel
  getKeyById: async (id) => {
    const response = await api.get(`/keys/${id}`);
    return response.data;
  },

  // Hämta nyckel via serie och nummer
  findBySerieAndNumber: async (serie, number) => {
    const response = await api.get('/keys/search', {
      params: { serie, number },
    });
    return response.data;
  },

  // Skapa en ny nyckel
  createKey: async (keyData) => {
    const response = await api.post('/keys', keyData);
    return response.data;
  },

  // Uppdatera en nyckel
  updateKey: async (id, keyData) => {
    const { apartmentId, tenantId, ...rest } = keyData;
    const response = await api.put(`/keys/${id}`, rest);
    
    if (apartmentId) {
      await api.put(`/keys/${id}/apartment?apartmentId=${apartmentId}`);
    }
    
    if (tenantId) {
      await api.put(`/keys/${id}/tenant?tenantId=${tenantId}`);
    }
    
    return response.data;
  },

  // Ta bort en nyckel
  deleteKey: async (id) => {
    const response = await api.delete(`/keys/${id}`);
    return response.data;
  },

  // Sök nycklar efter typ
  findByType: async (type) => {
    const response = await api.get(`/keys/search/type/${type}`);
    return response.data;
  },

  // Hämta nycklar för en specifik lägenhet
  findByApartmentId: async (apartmentId) => {
    const response = await api.get(`/keys/search/apartment/${apartmentId}`);
    return response.data;
  },

  // Hämta nycklar för en specifik hyresgäst
  findByTenantId: async (tenantId) => {
    const response = await api.get(`/keys/search/tenant/${tenantId}`);
    return response.data;
  },

  // Tilldela en lägenhet till en nyckel
  assignApartment: async (keyId, apartmentId) => {
    const response = await api.put(`/keys/${keyId}/apartment?apartmentId=${apartmentId}`);
    return response.data;
  },

  // Tilldela en hyresgäst till en nyckel
  assignTenant: async (keyId, tenantId) => {
    const response = await api.put(`/keys/${keyId}/tenant?tenantId=${tenantId}`);
    return response.data;
  },

  // Ta bort lägenhet från en nyckel
  removeApartment: async (keyId) => {
    const response = await api.delete(`/keys/${keyId}/apartment`);
    return response.data;
  },

  // Ta bort hyresgäst från en nyckel
  removeTenant: async (keyId) => {
    const response = await api.delete(`/keys/${keyId}/tenant`);
    return response.data;
  },
};

export default keyService; 