import api from './api';
import { getFromCache, saveToCache, CACHE_KEYS } from '../utils/cacheManager';
import axios from 'axios';

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
      // Säkerställ att vi använder rätt URL-format
      const apiUrl = `/api/interests/${id}/schedule-showing`;
      
      console.log("API Call: Schemalägger visning", {
        url: apiUrl,
        method: "POST",
        data: data
      });
      
      const token = localStorage.getItem('auth_auth_token');
      console.log("Token finns i localStorage:", !!token);
      
      // Använd explicit full URL med host och path
      const response = await api.post(apiUrl, data);
      
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
          headers: error.response.headers,
          url: error.config.url // Logga vilken URL som användes
        });
      } else if (error.request) {
        console.error("API Request fel (ingen respons):", error.request);
      } else {
        console.error("API Annat fel:", error.message);
      }
      throw error;
    }
  },
  
  scheduleShowingV2: async (id, data) => {
    try {
      console.log("API Call V2: Schemalägger visning med explicit URL");
      
      // Bygg URL manuellt för att säkerställa korrekt format
      const fullUrl = `http://localhost:8080/api/interests/${id}/schedule-showing`;
      
      console.log(`Anropar: ${fullUrl}`);
      
      // Skapa request manuellt med axios
      const axiosConfig = {
        method: 'post',
        url: fullUrl,
        data: data,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_auth_token')}`
        }
      };
      
      const response = await axios(axiosConfig);
      
      console.log("API Svar V2: Schemaläggning lyckades", {
        status: response.status,
        data: response.data
      });
      return response.data;
    } catch (error) {
      console.error("API Fel V2: Schemaläggning misslyckades", error);
      throw error;
    }
  }
}; 