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
  
  getShowingsByDateRange: async (startDate, endDate) => {
    try {
      const response = await api.get(`/api/showings/calendar?startDate=${startDate}&endDate=${endDate}`);
      
      const normalizedShowings = response.data.map(showing => {
        if (!showing.dateTime) return showing;
        
        try {
          // Normalisera datumet för att hantera tidszoner korrekt
          const date = new Date(showing.dateTime);
          
          // Formatera datum i ISO-format
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          
          // Skapa en lokalversion av datumet med tidzon-kompensation
          const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}:00`;
          
          // Lägg till ett hjälpfält för filtrering i kalender-komponent
          const dateObj = new Date(year, month - 1, day, hours, minutes);
          
          return {
            ...showing,
            dateTime: formattedDateTime,
            // Lägg till ett hjälpfält för att underlätta filtrering
            _dateTimeObj: dateObj
          };
        } catch (e) {
          console.error('Fel vid normalisering av visningstid:', e, showing);
          return showing;
        }
      });
      
      return normalizedShowings;
    } catch (error) {
      console.error('Error fetching showings by date range:', error);
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
      const response = await api.patch(`/api/showings/${id}`, showingData);
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
  },
  
  assignShowing: async (id, userId) => {
    try {
      const response = await api.patch(`/api/showings/${id}/assign`, { userId });
      return response.data;
    } catch (error) {
      console.error(`Error assigning showing ${id} to user ${userId}:`, error);
      throw error;
    }
  }
};

export default showingService; 