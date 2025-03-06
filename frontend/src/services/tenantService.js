import api from './api';

const tenantService = {
  // Hämta alla hyresgäster
  getAllTenants: async () => {
    const response = await api.get('/tenants');
    return response.data;
  },

  // Hämta en specifik hyresgäst
  getTenantById: async (id) => {
    const response = await api.get(`/tenants/${id}`);
    return response.data;
  },

  // Hämta hyresgäst via personnummer
  getTenantByPersonnummer: async (personnummer) => {
    const response = await api.get(`/tenants/personnummer/${personnummer}`);
    return response.data;
  },

  // Skapa en ny hyresgäst
  createTenant: async (tenantData) => {
    const response = await api.post('/tenants', tenantData);
    return response.data;
  },

  // Uppdatera en hyresgäst
  updateTenant: async (id, tenantData) => {
    const response = await api.put(`/tenants/${id}`, tenantData);
    return response.data;
  },

  // Ta bort en hyresgäst
  deleteTenant: async (id) => {
    const response = await api.delete(`/tenants/${id}`);
    return response.data;
  },

  // Sök hyresgäster efter efternamn
  findByLastName: async (lastName) => {
    const response = await api.get(`/tenants/search/lastname/${lastName}`);
    return response.data;
  },

  // Sök hyresgäster efter inflyttningsdatum
  findByMovedInDateBetween: async (startDate, endDate) => {
    const response = await api.get('/tenants/search/movedin', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Hämta uppsagda hyresgäster
  findTenantsWithResiliated: async () => {
    const response = await api.get('/tenants/search/resiliated');
    return response.data;
  },

  // Tilldela en lägenhet till en hyresgäst
  assignApartment: async (tenantId, apartmentId) => {
    const response = await api.put(`/tenants/${tenantId}/apartment?apartmentId=${apartmentId}`);
    return response.data;
  },

  // Tilldela en nyckel till en hyresgäst
  assignKey: async (tenantId, keyId) => {
    const response = await api.put(`/tenants/${tenantId}/key?keyId=${keyId}`);
    return response.data;
  },

  // Ta bort lägenhet från en hyresgäst
  removeApartment: async (tenantId) => {
    const response = await api.delete(`/tenants/${tenantId}/apartment`);
    return response.data;
  },

  // Ta bort nyckel från en hyresgäst
  removeKey: async (tenantId) => {
    const response = await api.delete(`/tenants/${tenantId}/key`);
    return response.data;
  },
};

export default tenantService; 