import axios from './api';
import { getFromCache, saveToCache, invalidateCache, CACHE_KEYS } from '../utils/cacheManager';

const getAll = async (bypassCache = false) => {
  try {
    // Kontrollera om data finns i cache och om vi inte explicit vill gå förbi cachen
    if (!bypassCache) {
      const cachedData = getFromCache(CACHE_KEYS.PENDING_TASKS);
      if (cachedData) return cachedData;
    }
    
    // Hämta data från API om det inte finns i cache eller om vi vill gå förbi cachen
    const response = await axios.get('/api/pending-tasks');
    
    // Spara den nya datan i cache
    saveToCache(CACHE_KEYS.PENDING_TASKS, response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching pending tasks:', error);
    throw error;
  }
};

const getById = async (id) => {
  try {
    // Försök hitta uppgiften i cachen först
    const cachedTasks = getFromCache(CACHE_KEYS.PENDING_TASKS);
    if (cachedTasks) {
      const cachedTask = cachedTasks.find(task => task.id === id);
      if (cachedTask) return cachedTask;
    }
    
    // Om den inte finns i cache, hämta från API
    const response = await axios.get(`/api/pending-tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching pending task ${id}:`, error);
    throw error;
  }
};

const getUnreviewedCount = async (bypassCache = false) => {
  try {
    // Kontrollera om data finns i cache och om vi inte explicit vill gå förbi cachen
    if (!bypassCache) {
      const cachedCount = getFromCache(CACHE_KEYS.UNREVIEWED_COUNT);
      if (cachedCount !== null) return cachedCount;
    }
    
    // Hämta data från API om det inte finns i cache eller om vi vill gå förbi cachen
    const response = await axios.get('/api/pending-tasks/unreview-count');
    
    // Spara den nya datan i cache
    saveToCache(CACHE_KEYS.UNREVIEWED_COUNT, response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching unreviewd count:', error);
    return 0; // Om API-anropet misslyckas visar vi 0 nya uppgifter
  }
};

const getEmailReports = async () => {
  try {
    const response = await axios.get('/api/pending-tasks/email-reports');
    return response.data;
  } catch (error) {
    console.error('Error fetching email reports:', error);
    throw error;
  }
};

const getPendingTasksForReview = async () => {
  try {
    const response = await axios.get('/api/pending-tasks/for-review');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending tasks for review:', error);
    throw error;
  }
};

const getApprovedTasks = async () => {
  try {
    const response = await axios.get('/api/pending-tasks/approved');
    return response.data;
  } catch (error) {
    console.error('Error fetching approved tasks:', error);
    throw error;
  }
};

const approvePendingTask = async (pendingTaskId, reviewData) => {
  try {
    const response = await axios.post(`/api/pending-tasks/${pendingTaskId}/approve`, reviewData);
    
    // Invalidera cachen för väntande uppgifter och antal olästa
    invalidateCache(CACHE_KEYS.PENDING_TASKS);
    invalidateCache(CACHE_KEYS.UNREVIEWED_COUNT);
    
    return response.data;
  } catch (error) {
    console.error(`Error approving pending task ${pendingTaskId}:`, error);
    throw error;
  }
};

const rejectPendingTask = async (pendingTaskId, reviewData) => {
  try {
    const response = await axios.post(`/api/pending-tasks/${pendingTaskId}/reject`, reviewData);
    
    // Invalidera cachen för väntande uppgifter och antal olästa
    invalidateCache(CACHE_KEYS.PENDING_TASKS);
    invalidateCache(CACHE_KEYS.UNREVIEWED_COUNT);
    
    return response.data;
  } catch (error) {
    console.error(`Error rejecting pending task ${pendingTaskId}:`, error);
    throw error;
  }
};

const pendingTaskService = {
  getAll,
  getById,
  getUnreviewedCount,
  getEmailReports,
  getPendingTasksForReview,
  getApprovedTasks,
  approvePendingTask,
  rejectPendingTask
};

export default pendingTaskService; 