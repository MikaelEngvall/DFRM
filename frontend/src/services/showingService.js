import api from './api';

const showingService = {
  getAll: async () => {
    try {
      const response = await api.get('/api/showings');
      return response.data;
    } catch (error) {
      console.error('Error fetching showings:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/api/showings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching showing ${id}:`, error);
      throw error;
    }
  },
  
  getForCalendar: async (startDate, endDate) => {
    try {
      const response = await api.get(`/api/showings/calendar?startDate=${startDate}&endDate=${endDate}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching showings for calendar:', error);
      throw error;
    }
  },
  
  getForUser: async (userId) => {
    try {
      const response = await api.get(`/api/showings/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching showings for user ${userId}:`, error);
      throw error;
    }
  },
  
  getActive: async () => {
    try {
      const response = await api.get('/api/showings/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active showings:', error);
      throw error;
    }
  },
  
  create: async (showingData) => {
    try {
      const response = await api.post('/api/showings', showingData);
      return response.data;
    } catch (error) {
      console.error('Error creating showing:', error);
      throw error;
    }
  },
  
  createFromInterest: async (interestId, showingData) => {
    try {
      const response = await api.post(`/api/showings/from-interest/${interestId}`, showingData);
      return response.data;
    } catch (error) {
      console.error(`Error creating showing from interest ${interestId}:`, error);
      throw error;
    }
  },
  
  update: async (id, showingData) => {
    try {
      const response = await api.put(`/api/showings/${id}`, showingData);
      return response.data;
    } catch (error) {
      console.error(`Error updating showing ${id}:`, error);
      throw error;
    }
  },
  
  updateStatus: async (id, status) => {
    try {
      const response = await api.put(`/api/showings/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating showing status ${id}:`, error);
      throw error;
    }
  },
  
  deleteShowing: async (id) => {
    try {
      const response = await api.delete(`/api/showings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting showing ${id}:`, error);
      throw error;
    }
  }
};

export default showingService; 