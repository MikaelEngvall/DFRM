import api from '../api';

const pendingEmailReportService = {
  /**
   * Hämtar alla e-postrapporter
   * @returns {Promise<Array>} Lista med e-postrapporter
   */
  getAll: async () => {
    try {
      const response = await api.get('/pending-tasks/email-reports');
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
      const response = await api.post(`/pending-tasks/${id}/convert-to-task`, taskData);
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
      const response = await api.post(`/pending-tasks/${id}/reject-email`, {
        reviewedById,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Fel vid avvisning av e-postrapport:', error);
      throw error;
    }
  }
};

export default pendingEmailReportService; 