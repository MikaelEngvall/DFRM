import api from './api';
import { getFromCache, saveToCache, removeFromCache, CACHE_KEYS } from '../utils/cacheManager';
import axios from 'axios';
import { createLogger } from '../utils/logger';

const logger = createLogger('InterestService');

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
      
      return response.data;
    } catch (error) {
      console.error("=== FEL VID API-ANROP ===");
      
      if (error.response) {
        // Server svarade med felkod
        console.error("Status:", error.response.status);
        console.error("Statustext:", error.response.statusText);
        console.error("URL som användes:", error.config.url);
        console.error("Svarsdata:", error.response.data);
        console.error("Headers:", error.response.headers);
      } else if (error.request) {
        // Ingen respons mottogs
        console.error("Ingen respons från servern:", error.request);
      } else {
        // Något annat fel inträffade
        console.error("Fel:", error.message);
      }
      
      throw error;
    }
  },
  
  scheduleShowingV3: async (id, data) => {
    try {
      console.log("=== FETCH API ANROP ===");
      
      // Bygg URL manuellt
      const fullUrl = `http://localhost:8080/api/interests/${id}/schedule-showing`;
      console.log(`Anropar URL: ${fullUrl}`);
      console.log("Data som skickas:", JSON.stringify(data, null, 2));
      
      // Hämta token från local storage
      const token = localStorage.getItem('auth_auth_token');
      console.log("Token finns:", token ? "JA" : "NEJ");
      
      // Skapa fetch options
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(data)
      };
      
      // Gör anropet med fetch
      const response = await fetch(fullUrl, options);
      console.log("Status:", response.status);
      console.log("StatusText:", response.statusText);
      
      // Om responsen inte är OK, kasta ett fel
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Svarsdata vid fel:", errorData);
        throw new Error(`Server svarade med status ${response.status}: ${errorData.message || response.statusText}`);
      }
      
      // Om allt gick bra, returnera svarsdata
      const responseData = await response.json();
      console.log("Svarsdata:", responseData);
      return responseData;
    } catch (error) {
      console.error("=== FETCH API FEL ===");
      console.error(error.message || "Okänt fel");
      throw error;
    }
  },
  
  clearCache: () => {
    console.log("Manuellt rensar alla intresseanmälningscache");
    clearInterestCache();
    return true;
  },
  
  getInterestsForReview: async () => {
    try {
      // Först hämta intresseanmälningar från servern
      console.log('Hämtar och kontrollerar nya intresseanmälningar');
      
      // Kör check-emails för att säkerställa att alla olästa e-postmeddelanden har processats
      await interestService.checkEmails();
      
      // Hämta de uppdaterade intresseanmälningarna
      const timestamp = new Date().getTime();
      const response = await api.get(`/api/interests/for-review?t=${timestamp}`);
      
      // Uppdatera cachen
      saveToCache(CACHE_KEYS.INTERESTS_FOR_REVIEW, response.data);
      
      return response.data;
    } catch (error) {
      console.error('Fel vid hämtning av intresseanmälningar för granskning:', error);
      throw error;
    }
  },
  
  /**
   * Hämtar detaljerad information om visningar
   * @returns {Promise<Array>} Lista med visningsdetaljer
   */
  getDetailedShowings: async () => {
    try {
      // Använd /api/showings istället för /api/showings/detailed
      const response = await api.get('/api/showings');
      logger.info(`Hämtade ${response.data.length} visningsdetaljer`);
      return response.data;
    } catch (error) {
      logger.error('Fel vid hämtning av visningsdetaljer:', error);
      throw error;
    }
  },
  
  /**
   * Hämtar lägenheter med information om nuvarande hyresgäster
   * @returns {Promise<Array>} Lista med lägenheter inklusive hyresgästinformation
   */
  getApartmentsWithTenants: async () => {
    try {
      const response = await api.get('/api/apartments', {
        params: { includeTenants: true }
      });
      logger.info(`Hämtade ${response.data.length} lägenheter med hyresgästinformation`);
      return response.data;
    } catch (error) {
      logger.error('Fel vid hämtning av lägenheter med hyresgäster:', error);
      throw error;
    }
  }
};

// Hjälpfunktion för att rensa cache
function clearInterestCache() {
  console.log("Rensar cache för intresseanmälningar");
  removeFromCache(CACHE_KEYS.INTERESTS);
  removeFromCache(CACHE_KEYS.INTERESTS_FOR_REVIEW);
  removeFromCache(CACHE_KEYS.REVIEWED_INTERESTS);
} 