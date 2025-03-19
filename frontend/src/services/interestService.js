import api from './api';
import { getFromCache, saveToCache, CACHE_KEYS } from '../utils/cacheManager';

export const interestService = {
  getAll: async () => {
    try {
      const response = await api.get('/api/interests');
      return response.data;
    } catch (error) {
      console.error('Error fetching interests:', error);
      throw error;
    }
  },
  
  getForReview: async () => {
    try {
      const response = await api.get('/api/interests/for-review');
      return response.data;
    } catch (error) {
      console.error('Error fetching interests for review:', error);
      throw error;
    }
  },
  
  getReviewed: async () => {
    try {
      const response = await api.get('/api/interests/reviewed');
      return response.data;
    } catch (error) {
      console.error('Error fetching reviewed interests:', error);
      throw error;
    }
  },
  
  getUnreviewedCount: async (skipCache = false) => {
    try {
      const url = skipCache 
        ? `/api/interests/unreview-count?t=${new Date().getTime()}` 
        : '/api/interests/unreview-count';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching unreviewed interests count:', error);
      throw error;
    }
  },
  
  reviewInterest: async (id, reviewData) => {
    try {
      const response = await api.post(`/api/interests/${id}/review`, reviewData);
      return response.data;
    } catch (error) {
      console.error(`Error reviewing interest ${id}:`, error);
      throw error;
    }
  },
  
  rejectInterest: async (id, rejectData) => {
    try {
      const response = await api.post(`/api/interests/${id}/reject`, rejectData);
      return response.data;
    } catch (error) {
      console.error(`Error rejecting interest ${id}:`, error);
      throw error;
    }
  },
  
  checkEmails: async () => {
    try {
      const response = await api.post('/api/interests/check-emails');
      return response.data;
    } catch (error) {
      console.error('Error checking interest emails:', error);
      throw error;
    }
  },
  
  scheduleShowing: async (id, data) => {
    try {
      console.log("API Call: Schemalägger visning", {
        url: `/api/interests/${id}/schedule-showing`,
        method: "POST",
        data: data,
        headers: "Authorization header should be added via interceptor"
      });
      
      const token = localStorage.getItem('auth_auth_token');
      console.log("Token finns i localStorage:", !!token);
      
      const response = await api.post(`/api/interests/${id}/schedule-showing`, data);
      console.log("API Svar: Schemaläggning lyckades", {
        status: response.status,
        data: response.data
      });
      return response.data;
    } catch (error) {
      console.error("API Fel: Schemaläggning misslyckades", error);
      if (error.response) {
        console.error("API Felsvar:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error("API Request fel (ingen respons):", error.request);
      } else {
        console.error("API Annat fel:", error.message);
      }
      throw error;
    }
  }
}; 