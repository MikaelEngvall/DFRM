import api from './api';
import { getFromCache, saveToCache, invalidateCache, CACHE_KEYS } from '../utils/cacheManager';

const pendingEmailReportService = {
  /**
   * Hämtar alla e-postrapporter
   * @param {boolean} bypassCache - Om true, hämtas data direkt från API oavsett cache
   * @returns {Promise<Array>} Lista med e-postrapporter
   */
  getAll: async (bypassCache = false) => {
    try {
      // Kontrollera om data finns i cache och om vi inte explicit vill gå förbi cachen
      if (!bypassCache) {
        const cachedData = getFromCache(CACHE_KEYS.EMAIL_REPORTS);
        if (cachedData) return cachedData;
      }
      
      // Hämta data från API om det inte finns i cache eller om vi vill gå förbi cachen
      const response = await api.get('/api/pending-tasks/email-reports');
      
      // Spara den nya datan i cache
      saveToCache(CACHE_KEYS.EMAIL_REPORTS, response.data);
      
      return response.data;
    } catch (error) {
      console.error('Fel vid hämtning av e-postrapporter:', error);
      return [];
    }
  },

  /**
   * Konverterar en e-postrapport till en vanlig uppgift
   * @param {string} id - ID för e-postrapporten
   * @param {object} taskData - Data för den nya uppgiften
   * @returns {Promise<object>} Den sparade uppgiften
   */
  convertToTask: async (id, taskData) => {
    try {
      const response = await api.post(`/api/pending-tasks/${id}/convert-to-task`, taskData);
      
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
      const response = await api.post(`/api/pending-tasks/${id}/reject-email`, {
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