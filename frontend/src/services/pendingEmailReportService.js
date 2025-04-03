import api from './api';
import { invalidateCache, CACHE_KEYS } from '../utils/cacheManager';
import { fetchWithCache, cleanId } from '../utils/dataService';

const pendingEmailReportService = {
  /**
   * Hämtar alla e-postrapporter
   * @param {boolean} bypassCache - Om true, hämtas data direkt från API oavsett cache
   * @returns {Promise<Array>} Lista med e-postrapporter
   */
  getAll: async (bypassCache = false) => {
    return fetchWithCache(
      '/api/pending-tasks/email-reports',
      CACHE_KEYS.EMAIL_REPORTS,
      bypassCache,
      'e-postrapport',
      api.get
    );
  },

  /**
   * Konverterar en e-postrapport till en vanlig uppgift
   * @param {string} id - ID för e-postrapporten
   * @param {object} taskData - Data för den nya uppgiften
   * @returns {Promise<object>} Den sparade uppgiften
   */
  convertToTask: async (id, taskData) => {
    try {
      const cleanedId = cleanId(id);
      console.log(`Försöker konvertera e-postrapport med rensat ID: ${cleanedId}`);
      
      const endpoint = `/api/pending-tasks/${cleanedId}/convert-to-task`;
      console.log(`Använder endpoint: ${endpoint}`);
      
      const response = await api.post(endpoint, taskData);
      
      // Invalidera cachen för e-postrapporter
      invalidateCache(CACHE_KEYS.EMAIL_REPORTS);
      
      return response.data;
    } catch (error) {
      console.error('Fel vid konvertering av e-postrapport till uppgift:', error);
      throw error;
    }
  },

  /**
   * Avvisar en e-postrapport
   * @param {string} id - ID för e-postrapporten
   * @param {string} reviewedById - ID för användaren som avvisar
   * @param {string} reason - Anledning till avvisning
   * @returns {Promise<object>} Den uppdaterade e-postrapporten
   */
  rejectEmailReport: async (id, reviewedById, reason) => {
    try {
      const cleanedId = cleanId(id);
      console.log(`Avvisar e-postrapport med rensat ID: ${cleanedId}`);
      
      const endpoint = `/api/pending-tasks/${cleanedId}/reject-email`;
      console.log(`Använder endpoint för avvisning: ${endpoint}`);
      
      const response = await api.post(endpoint, {
        reviewedById,
        reason
      });
      
      // Invalidera cachen för e-postrapporter
      invalidateCache(CACHE_KEYS.EMAIL_REPORTS);
      
      return response.data;
    } catch (error) {
      console.error('Fel vid avvisning av e-postrapport:', error);
      throw error;
    }
  }
};

export default pendingEmailReportService; 