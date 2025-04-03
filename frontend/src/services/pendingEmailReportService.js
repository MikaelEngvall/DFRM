import api from './api';
import { invalidateCache, CACHE_KEYS } from '../utils/cacheManager';
import { fetchWithCache, cleanId } from '../utils/dataService';
import { createLogger } from '../utils/logger';

// Skapa en logger för denna service
const logger = createLogger('PendingEmailReportService');

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
      logger.debug(`Försöker konvertera e-postrapport med rensat ID: ${cleanedId}`);
      
      const endpoint = `/api/pending-tasks/${cleanedId}/convert-to-task`;
      logger.debug(`Använder endpoint: ${endpoint}`);
      
      const response = await api.post(endpoint, taskData);
      
      // Invalidera cachen för e-postrapporter
      invalidateCache(CACHE_KEYS.EMAIL_REPORTS);
      
      return response.data;
    } catch (error) {
      logger.error('Fel vid konvertering av e-postrapport till uppgift:', error);
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
      logger.debug(`Avvisar e-postrapport med rensat ID: ${cleanedId}`);
      
      const endpoint = `/api/pending-tasks/${cleanedId}/reject-email`;
      logger.debug(`Använder endpoint för avvisning: ${endpoint}`);
      
      const response = await api.post(endpoint, {
        reviewedById,
        reason
      });
      
      // Invalidera cachen för e-postrapporter
      invalidateCache(CACHE_KEYS.EMAIL_REPORTS);
      
      return response.data;
    } catch (error) {
      logger.error('Fel vid avvisning av e-postrapport:', error);
      throw error;
    }
  }
};

export default pendingEmailReportService; 