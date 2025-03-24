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
      
      // Kontrollera att vi fått en lista med unika objekt (på id-basis)
      if (response.data && Array.isArray(response.data)) {
        const uniqueIds = new Set();
        const uniqueReports = response.data.filter(report => {
          if (!report.id || uniqueIds.has(report.id)) {
            // Ignorera om id saknas eller duplicerat
            console.warn("Filtrerar bort duplicerat/ogiltigt email-report:", report);
            return false;
          }
          uniqueIds.add(report.id);
          return true;
        });
        
        // Logga om vi filtrerat bort objekt
        if (uniqueReports.length !== response.data.length) {
          console.warn(`Filtrerade bort ${response.data.length - uniqueReports.length} duplicerade e-postrapporter`);
        }
        
        // Spara den filtrerade datan i cache
        saveToCache(CACHE_KEYS.EMAIL_REPORTS, uniqueReports);
        
        return uniqueReports;
      }
      
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
      // Rensa ID från alla prefix (email-, task-)
      const cleanId = id.replace('email-', '').replace('task-', '');
      console.log(`Försöker konvertera e-postrapport med rensat ID: ${cleanId}`);
      
      // Använd det rena ID:t utan prefix
      const endpoint = `/api/pending-tasks/${cleanId}/convert-to-task`;
      console.log(`Använder endpoint: ${endpoint}`);
      
      // Gör API-anropet med det rena ID:t
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
      // Rensa ID från alla prefix (email-, task-)
      const cleanId = id.replace('email-', '').replace('task-', '');
      console.log(`Avvisar e-postrapport med rensat ID: ${cleanId}`);
      
      const endpoint = `/api/pending-tasks/${cleanId}/reject-email`;
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