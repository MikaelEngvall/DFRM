import api from './api';

const apartmentService = {
  // Hämta alla lägenheter
  getAllApartments: async () => {
    const response = await api.get('/api/apartments');
    return response.data;
  },

  // Hämta en specifik lägenhet
  getApartmentById: async (id) => {
    const response = await api.get(`/api/apartments/${id}`);
    return response.data;
  },

  // Skapa en ny lägenhet
  createApartment: async (apartmentData) => {
    const response = await api.post('/api/apartments', apartmentData);
    return response.data;
  },

  // Uppdatera en lägenhet
  updateApartment: async (id, apartmentData) => {
    const response = await api.put(`/api/apartments/${id}`, apartmentData);
    return response.data;
  },

  // Ta bort en lägenhet
  deleteApartment: async (id) => {
    const response = await api.delete(`/api/apartments/${id}`);
    return response.data;
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
    const response = await api.get('/api/apartments/search/address', {
      params: { street, number, apartmentNumber },
    });
    return response.data;
  },

  // Tilldela en hyresgäst till en lägenhet
  assignTenant: async (apartmentId, tenantId) => {
    const response = await api.put(`/api/apartments/${apartmentId}/tenant?tenantId=${tenantId}`);
    return response.data;
  },

  // Tilldela en nyckel till en lägenhet
  assignKey: async (apartmentId, keyId) => {
    const response = await api.put(`/api/apartments/${apartmentId}/key?keyId=${keyId}`);
    return response.data;
  },

  // Ta bort en hyresgäst från en lägenhet
  removeTenant: async (apartmentId, tenantId) => {
    const response = await api.delete(`/api/apartments/${apartmentId}/tenant/${tenantId}`);
    return response.data;
  },

  // Ta bort en nyckel från en lägenhet
  removeKey: async (apartmentId, keyId) => {
    const response = await api.delete(`/api/apartments/${apartmentId}/key/${keyId}`);
    return response.data;
  },
};

export default apartmentService; 