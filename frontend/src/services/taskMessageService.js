import api from './api';
import { invalidateCache, CACHE_KEYS } from '../utils/cacheManager';

/**
 * Hämtar alla meddelanden för en specifik uppgift
 * 
 * @param {string} taskId ID för uppgiften
 * @returns {Promise<Array>} Lista med meddelanden
 */
export const getMessagesByTaskId = async (taskId) => {
  try {
    const response = await api.get(`/api/tasks/${taskId}/messages`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching messages for task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Skapar ett nytt meddelande för en uppgift
 * 
 * @param {string} taskId ID för uppgiften
 * @param {string} content Meddelandets innehåll
 * @param {string} language Språkkod (sv, en, pl, uk)
 * @returns {Promise<Object>} Det skapade meddelandet
 */
export const createMessage = async (taskId, content, language) => {
  try {
    const response = await api.post(`/api/tasks/${taskId}/messages`, {
      content,
      language
    });
    
    // Invalidera cachen för uppgifter eftersom vi lagt till ett meddelande
    invalidateCache(CACHE_KEYS.TASKS);
    
    return response.data;
  } catch (error) {
    console.error(`Error creating message for task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Tar bort ett meddelande
 * 
 * @param {string} taskId ID för uppgiften
 * @param {string} messageId ID för meddelandet
 * @returns {Promise<void>}
 */
export const deleteMessage = async (taskId, messageId) => {
  try {
    await api.delete(`/api/tasks/${taskId}/messages/${messageId}`);
    
    // Invalidera cachen för uppgifter eftersom vi tagit bort ett meddelande
    invalidateCache(CACHE_KEYS.TASKS);
  } catch (error) {
    console.error(`Error deleting message ${messageId} for task ${taskId}:`, error);
    throw error;
  }
};

const taskMessageService = {
  getMessagesByTaskId,
  createMessage,
  deleteMessage
};

export default taskMessageService; 