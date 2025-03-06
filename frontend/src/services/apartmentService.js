import api from './api';

const apartmentService = {
  // Hämta alla lägenheter
  getAllApartments: async () => {
    const response = await api.get('/apartments');
    return response.data;
  },

  // Hämta en specifik lägenhet
  getApartmentById: async (id) => {
    const response = await api.get(`/apartments/${id}`);
    return response.data;
  },

  // Skapa en ny lägenhet
  createApartment: async (apartmentData) => {
    const response = await api.post('/apartments', apartmentData);
    return response.data;
  },

  // Uppdatera en lägenhet
  updateApartment: async (id, apartmentData) => {
    const response = await api.put(`/apartments/${id}`, apartmentData);
    return response.data;
  },

  // Ta bort en lägenhet
  deleteApartment: async (id) => {
    const response = await api.delete(`/apartments/${id}`);
    return response.data;
  },

  // Sök lägenheter efter stad
  findByCity: async (city) => {
    const response = await api.get(`/apartments/search/city/${city}`);
    return response.data;
  },

  // Sök lägenheter efter minsta antal rum
  findByRooms: async (minRooms) => {
    const response = await api.get(`/apartments/search/rooms/${minRooms}`);
    return response.data;
  },

  // Sök lägenheter efter maxpris
  findByPrice: async (maxPrice) => {
    const response = await api.get(`/apartments/search/price/${maxPrice}`);
    return response.data;
  },

  // Sök lägenheter efter adress
  findByAddress: async (street, number, apartmentNumber) => {
    const response = await api.get('/apartments/search/address', {
      params: { street, number, apartmentNumber },
    });
    return response.data;
  },
};

export default apartmentService; 