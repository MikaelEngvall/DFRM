import api from './api';
import { getFromCache, saveToCache, addToCache, updateInCache, removeFromCache, CACHE_KEYS } from '../utils/cacheManager';

// Cache-nyckel för meddelanden per uppgift
const getMessagesCacheKey = (taskId) => `${CACHE_KEYS.TASKS}_${taskId}_messages`;

/**
 * Hämtar alla meddelanden för en specifik uppgift
 * 
 * @param {string} taskId ID för uppgiften
 * @param {boolean} bypassCache Om true, hämtas data direkt från API oavsett cache
 * @returns {Promise<Array>} Lista med meddelanden
 */
export const getMessagesByTaskId = async (taskId, bypassCache = false) => {
  try {
    // Skapa en unik cache-nyckel för denna uppgifts meddelanden
    const cacheKey = `${CACHE_KEYS.TASK_MESSAGES}_${taskId}`;
    
    // Kontrollera om data finns i cache och om vi inte explicit vill gå förbi cachen
    if (!bypassCache) {
      const cachedData = getFromCache(cacheKey);
      if (cachedData) return cachedData;
    }
    
    // Hämta data från API om det inte finns i cache eller om vi vill gå förbi cachen
    const response = await api.get(`/api/tasks/${taskId}/messages`);
    
    // Spara den nya datan i cache endast om API-anropet lyckades
    if (response.data) {
      saveToCache(cacheKey, response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching messages for task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Hämtar ett specifikt meddelande
 * 
 * @param {string} taskId ID för uppgiften
 * @param {string} messageId ID för meddelandet
 * @returns {Promise<Object>} Det hämtade meddelandet
 */
export const getMessageById = async (taskId, messageId) => {
  try {
    // Skapa en unik cache-nyckel för denna uppgifts meddelanden
    const cacheKey = `${CACHE_KEYS.TASK_MESSAGES}_${taskId}`;
    
    // Försök hitta meddelandet i cachen först
    const cachedMessages = getFromCache(cacheKey);
    if (cachedMessages) {
      const cachedMessage = cachedMessages.find(msg => msg.id === messageId);
      if (cachedMessage) return cachedMessage;
    }
    
    const response = await api.get(`/api/tasks/${taskId}/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching message ${messageId} for task ${taskId}:`, error);
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
    // Skapa en unik cache-nyckel för denna uppgifts meddelanden
    const cacheKey = `${CACHE_KEYS.TASK_MESSAGES}_${taskId}`;
    
    // Skapa meddelandet i databasen först
    const response = await api.post(`/api/tasks/${taskId}/messages`, {
      content,
      language
    });
    
    // Om databasen uppdaterades framgångsrikt, uppdatera cachen
    if (response.data) {
      const cachedMessages = getFromCache(cacheKey) || [];
      saveToCache(cacheKey, [...cachedMessages, response.data]);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error creating message for task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Uppdaterar ett meddelande
 * 
 * @param {string} taskId ID för uppgiften
 * @param {string} messageId ID för meddelandet
 * @param {Object} messageData Nytt meddelandedatum
 * @returns {Promise<Object>} Det uppdaterade meddelandet
 */
export const updateMessage = async (taskId, messageId, messageData) => {
  try {
    // Skapa en unik cache-nyckel för denna uppgifts meddelanden
    const cacheKey = `${CACHE_KEYS.TASK_MESSAGES}_${taskId}`;
    
    // Uppdatera i databasen först
    const response = await api.patch(`/api/tasks/${taskId}/messages/${messageId}`, messageData);
    
    // Om databasen uppdaterades framgångsrikt, uppdatera cachen
    if (response.data) {
      const cachedMessages = getFromCache(cacheKey);
      if (cachedMessages) {
        const updatedMessages = cachedMessages.map(msg => 
          msg.id === messageId ? response.data : msg
        );
        saveToCache(cacheKey, updatedMessages);
      }
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error updating message ${messageId} for task ${taskId}:`, error);
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
    // Skapa en unik cache-nyckel för denna uppgifts meddelanden
    const cacheKey = `${CACHE_KEYS.TASK_MESSAGES}_${taskId}`;
    
    // Ta bort från databasen först
    await api.delete(`/api/tasks/${taskId}/messages/${messageId}`);
    
    // Om borttagningen lyckades, uppdatera cachen
    const cachedMessages = getFromCache(cacheKey);
    if (cachedMessages) {
      const updatedMessages = cachedMessages.filter(msg => msg.id !== messageId);
      saveToCache(cacheKey, updatedMessages);
    }
  } catch (error) {
    console.error(`Error deleting message ${messageId} for task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Markera ett meddelande som läst
 * 
 * @param {string} taskId ID för uppgiften
 * @param {string} messageId ID för meddelandet
 * @returns {Promise<Object>} Det uppdaterade meddelandet
 */
export const markAsRead = async (taskId, messageId) => {
  try {
    // Skapa en unik cache-nyckel för denna uppgifts meddelanden
    const cacheKey = `${CACHE_KEYS.TASK_MESSAGES}_${taskId}`;
    
    // Uppdatera i databasen först
    const response = await api.patch(`/api/tasks/${taskId}/messages/${messageId}/read`);
    
    // Om databasen uppdaterades framgångsrikt, uppdatera cachen
    if (response.data) {
      const cachedMessages = getFromCache(cacheKey);
      if (cachedMessages) {
        const updatedMessages = cachedMessages.map(msg => 
          msg.id === messageId ? response.data : msg
        );
        saveToCache(cacheKey, updatedMessages);
      }
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error marking message ${messageId} as read for task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Markera ett meddelande som oläst
 * 
 * @param {string} taskId ID för uppgiften
 * @param {string} messageId ID för meddelandet
 * @returns {Promise<Object>} Det uppdaterade meddelandet
 */
export const markAsUnread = async (taskId, messageId) => {
  try {
    // Skapa en unik cache-nyckel för denna uppgifts meddelanden
    const cacheKey = `${CACHE_KEYS.TASK_MESSAGES}_${taskId}`;
    
    // Uppdatera i databasen först
    const response = await api.patch(`/api/tasks/${taskId}/messages/${messageId}/unread`);
    
    // Om databasen uppdaterades framgångsrikt, uppdatera cachen
    if (response.data) {
      const cachedMessages = getFromCache(cacheKey);
      if (cachedMessages) {
        const updatedMessages = cachedMessages.map(msg => 
          msg.id === messageId ? response.data : msg
        );
        saveToCache(cacheKey, updatedMessages);
      }
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error marking message ${messageId} as unread for task ${taskId}:`, error);
    throw error;
  }
};

const taskMessageService = {
  getMessagesByTaskId,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
  markAsRead,
  markAsUnread
};

export default taskMessageService; 