import api from './api';

const tenantService = {
  // Hämta alla hyresgäster
  getAllTenants: async () => {
    const response = await api.get('/api/tenants');
    return response.data;
  },

  // Hämta en specifik hyresgäst
  getTenantById: async (id) => {
    const response = await api.get(`/api/tenants/${id}`);
    return response.data;
  },

  // Hämta hyresgäst via personnummer
  getTenantByPersonnummer: async (personnummer) => {
    const response = await api.get(`/api/tenants/personnummer/${personnummer}`);
    return response.data;
  },

  // Skapa en ny hyresgäst
  createTenant: async (tenantData) => {
    const response = await api.post('/api/tenants', tenantData);
    return response.data;
  },

  // Uppdatera en hyresgäst (fullständig ersättning)
  updateTenant: async (id, tenantData) => {
    const response = await api.put(`/api/tenants/${id}`, tenantData);
    return response.data;
  },

  // Partiell uppdatering av en hyresgäst (endast ändrade fält)
  patchTenant: async (id, partialData) => {
    const response = await api.patch(`/api/tenants/${id}`, partialData);
    return response.data;
  },

  // Ta bort en hyresgäst
  deleteTenant: async (id) => {
    const response = await api.delete(`/api/tenants/${id}`);
    return response.data;
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
    const response = await api.put(`/api/tenants/${tenantId}/apartment?apartmentId=${apartmentId}`);
    return response.data;
  },

  // Tilldela en nyckel till en hyresgäst
  assignKey: async (tenantId, keyId) => {
    const response = await api.put(`/api/tenants/${tenantId}/key?keyId=${keyId}`);
    return response.data;
  },

  // Ta bort lägenhet från en hyresgäst
  removeApartment: async (tenantId) => {
    const response = await api.delete(`/api/tenants/${tenantId}/apartment`);
    return response.data;
  },

  // Ta bort en specifik nyckel från en hyresgäst
  removeKey: async (tenantId, keyId) => {
    const response = await api.delete(`/api/tenants/${tenantId}/key/${keyId}`);
    return response.data;
  },

  // Ta bort alla nycklar från en hyresgäst
  removeAllKeys: async (tenantId) => {
    const response = await api.delete(`/api/tenants/${tenantId}/keys`);
    return response.data;
  },
};

export default tenantService; 