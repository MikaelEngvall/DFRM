import api from './api';

/**
 * Laddar upp en Excel-fil med hyresgäster och lägenheter för import.
 * @param {File} file - Excel-filen att ladda upp
 * @returns {Promise<Object>} - Responsdata från servern
 */
const uploadTenantsAndApartments = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/api/import/upload-tenant-apartment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Ett fel uppstod vid uppladdning av filen');
  }
};

/**
 * Importerar hyresgäster och lägenheter från en fil på servern.
 * @param {string} filePath - Sökvägen till filen på servern
 * @returns {Promise<Object>} - Responsdata från servern
 */
const importTenantsAndApartments = async (filePath) => {
  try {
    const response = await api.post('/api/import/tenant-apartment', null, {
      params: { filePath },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Ett fel uppstod vid import av filen');
  }
};

const importService = {
  uploadTenantsAndApartments,
  importTenantsAndApartments,
};

export default importService; 