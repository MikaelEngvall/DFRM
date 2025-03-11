import axios from './api';

/**
 * Hämtar alla e-postrapporter med status NEW
 * @returns {Promise<Array>} Lista med e-postrapporter
 */
const getEmailReports = async () => {
  try {
    const response = await axios.get('/api/pending-tasks/email-reports');
    return response.data;
  } catch (error) {
    console.error('Fel vid hämtning av e-postrapporter:', error);
    throw error;
  }
};

/**
 * Accepterar en e-postrapport och skapar en uppgift
 * @param {string} id ID för e-postrapporten
 * @param {Object} taskData Data för uppgiften som ska skapas
 * @returns {Promise<Object>} Den skapade uppgiften
 */
const acceptEmailReport = async (id, taskData) => {
  try {
    const response = await axios.post(`/api/pending-tasks/${id}/convert-to-task`, taskData);
    return response.data;
  } catch (error) {
    console.error(`Fel vid accepterande av e-postrapport ${id}:`, error);
    throw error;
  }
};

/**
 * Avvisar en e-postrapport
 * @param {string} id ID för e-postrapporten
 * @param {Object} rejectData Data för avvisandet
 * @returns {Promise<Object>} Den avvisade e-postrapporten
 */
const rejectEmailReport = async (id, rejectData) => {
  try {
    const response = await axios.post(`/api/pending-tasks/${id}/reject-email`, rejectData);
    return response.data;
  } catch (error) {
    console.error(`Fel vid avvisande av e-postrapport ${id}:`, error);
    throw error;
  }
};

const pendingEmailReportService = {
  getEmailReports,
  acceptEmailReport,
  rejectEmailReport
};

export default pendingEmailReportService; 