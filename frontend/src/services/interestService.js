import api from './api';
import { getFromCache, saveToCache, removeFromCache, CACHE_KEYS } from '../utils/cacheManager';
import axios from 'axios';
import { createLogger } from '../utils/logger';

const logger = createLogger('InterestService');

// Cachehantering för intresseanmälningar
let interestsCache = {
  unreviewed: null,
  reviewed: null,
  lastUpdated: null
};

const clearInterestCache = () => {
  interestsCache = {
    unreviewed: null,
    reviewed: null,
    lastUpdated: null
  };
  
  // Rensa även cache-nycklar
  removeFromCache(CACHE_KEYS.INTERESTS);
  removeFromCache(CACHE_KEYS.INTERESTS_FOR_REVIEW);
  removeFromCache(CACHE_KEYS.REVIEWED_INTERESTS);
};

export const interestService = {
  getAll: async (bypassCache = false, includeApartmentData = false) => {
    try {
      // Använd cache om det finns
      if (!bypassCache) {
        const cachedData = getFromCache(CACHE_KEYS.INTERESTS);
        if (cachedData) {
          console.log('Returning cached interests data');
          return cachedData;
        }
      }
      
      console.log('Fetching all interests from API');
      const timestamp = new Date().getTime(); // Lägg till timestamp för att förhindra caching
      const response = await api.get('/api/interests', {
        params: { includeApartmentData }
      });
      
      // Spara datan i cache
      saveToCache(CACHE_KEYS.INTERESTS, response.data);
      return response.data;
    } catch (error) {
      logger.error('Fel vid hämtning av intresseanmälningar:', error);
      // Om API-anrop misslyckas, försök använda cache även om bypassCache är true
      const cachedData = getFromCache(CACHE_KEYS.INTERESTS);
      if (cachedData) {
        console.log('API call failed, using cached interests data');
        return cachedData;
      }
      throw error;
    }
  },
  
  getForReview: async (bypassCache = false) => {
    try {
      // Alltid hämta färska data från API:et, oavsett bypassCache-värdet
      console.log('Fetching fresh interests for review from API');
      const timestamp = new Date().getTime(); // Lägg till timestamp för att förhindra caching
      const response = await api.get(`/api/interests/for-review?t=${timestamp}`);
      
      // Uppdatera cachen med nya data
      saveToCache(CACHE_KEYS.INTERESTS_FOR_REVIEW, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching interests for review:', error);
      
      // Om API-anrop misslyckas, försök använda cache som fallback
      const cachedData = getFromCache(CACHE_KEYS.INTERESTS_FOR_REVIEW);
      if (cachedData) {
        console.log('API call failed, using cached interests for review data as fallback');
        return cachedData;
      }
      
      throw error;
    }
  },
  
  getReviewed: async (bypassCache = false) => {
    try {
      // Alltid hämta färska data från API:et, oavsett bypassCache-värdet
      console.log('Fetching fresh reviewed interests from API');
      const timestamp = new Date().getTime(); // Lägg till timestamp för att förhindra caching
      const response = await api.get(`/api/interests/reviewed?t=${timestamp}`);
      
      // Uppdatera cachen med nya data
      saveToCache(CACHE_KEYS.REVIEWED_INTERESTS, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching reviewed interests:', error);
      
      // Om API-anrop misslyckas, försök använda cache som fallback
      const cachedData = getFromCache(CACHE_KEYS.REVIEWED_INTERESTS);
      if (cachedData) {
        console.log('API call failed, using cached reviewed interests data as fallback');
        return cachedData;
      }
      
      throw error;
    }
  },
  
  getUnreviewedCount: async (skipCache = false) => {
    try {
      const timestamp = new Date().getTime();
      const url = `/api/interests/unreview-count?t=${timestamp}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching unreviewed interests count:', error);
      throw error;
    }
  },
  
  reviewInterest: async (id, reviewData) => {
    try {
      console.log(`Reviewing interest ${id} with data:`, reviewData);
      const response = await api.post(`/api/interests/${id}/review`, reviewData);
      
      // Rensa cache efter ändring
      clearInterestCache();
      
      return response.data;
    } catch (error) {
      console.error(`Error reviewing interest ${id}:`, error);
      throw error;
    }
  },
  
  rejectInterest: async (id, rejectData) => {
    try {
      console.log(`Rejecting interest ${id} with data:`, rejectData);
      const response = await api.post(`/api/interests/${id}/reject`, rejectData);
      
      // Rensa cache efter ändring
      clearInterestCache();
      
      return response.data;
    } catch (error) {
      console.error(`Error rejecting interest ${id}:`, error);
      throw error;
    }
  },
  
  checkEmails: async () => {
    try {
      const timestamp = new Date().getTime();
      const response = await api.post(`/api/interests/check-emails?t=${timestamp}`);
      
      // Rensa cache efter ändring
      clearInterestCache();
      
      return response.data;
    } catch (error) {
      console.error('Error checking interest emails:', error);
      throw error;
    }
  },
  
  scheduleShowing: async (id, data) => {
    try {
      // Skapa en explicit URL som garanterat inkluderar /api/ prefixet
      const timestamp = new Date().getTime();
      const fullUrl = `http://localhost:8080/api/interests/${id}/schedule-showing?t=${timestamp}`;
      
      console.log("API Call: Schemalägger visning med direkt URL", {
        url: fullUrl,
        method: "POST"
      });
      
      const token = localStorage.getItem('auth_auth_token');
      console.log("Token finns i localStorage:", !!token);
      
      // Använd direkt axios-anrop istället för api.post
      const response = await axios({
        method: 'post',
        url: fullUrl,
        data: data,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("API Svar: Schemaläggning lyckades", {
        status: response.status,
        data: response.data
      });
      
      // Rensa cache efter ändring
      clearInterestCache();
      
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
      // Debugging-information: Visa exakt URL och data
      const fullUrl = `http://localhost:8080/api/interests/${id}/schedule-showing`;
      
      console.log("=== DEBUGGING INFORMATION ===");
      console.log(`Anropar URL: ${fullUrl}`);
      console.log("Data som skickas:", JSON.stringify(data, null, 2));
      
      // Hämta token från local storage
      const token = localStorage.getItem('auth_auth_token');
      console.log("Token existerar:", token ? "JA" : "NEJ");
      if (token) {
        console.log("Token längd:", token.length);
        console.log("Token början:", token.substring(0, 20) + "...");
      }
      
      // Skapa request-konfiguration
      const axiosConfig = {
        method: 'post',
        url: fullUrl,
        data: data,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      };
      
      console.log("Headers som skickas:", axiosConfig.headers);
      
      // Gör request
      const response = await axios(axiosConfig);
      
      console.log("=== SVAR FRÅN SERVER ===");
      console.log("Status:", response.status);
      console.log("Data:", response.data);
      
      // Rensa cache efter ändring
      clearInterestCache();
      
      return response.data;
    } catch (error) {
      console.error("=== ERROR DETAILS ===");
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
        console.error("Headers:", error.response.headers);
      } else {
        console.error("Error object:", error);
      }
      
      throw error;
    }
  },
  
  // Exportera intresseanmälningar som SQL
  exportToSql: async () => {
    try {
      const response = await api.get('/api/interests/export-sql', {
        responseType: 'blob'
      });
      
      // Skapa en URL för blob och ladda ner filen
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'interests_export.sql');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Error exporting interests to SQL:', error);
      throw error;
    }
  }
}; 