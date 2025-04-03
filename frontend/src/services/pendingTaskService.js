import api from './api';
import { getFromCache, saveToCache, addToCache, updateInCache, removeFromCache, invalidateCache, CACHE_KEYS } from '../utils/cacheManager';
import { fetchWithCache, filterUniqueById, cleanId } from '../utils/dataService';

const pendingTaskService = {
  // Hämta alla väntande uppgifter
  getAllPendingTasks: async (bypassCache = false) => {
    return fetchWithCache(
      '/api/pending-tasks',
      CACHE_KEYS.PENDING_TASKS,
      bypassCache,
      'väntande uppgift',
      api.get
    );
  },

  // Hämta en specifik väntande uppgift
  getPendingTaskById: async (id) => {
    try {
      // Försök hitta uppgiften i cachen först
      const cachedTasks = getFromCache(CACHE_KEYS.PENDING_TASKS);
      if (cachedTasks) {
        const cachedTask = cachedTasks.find(task => task.id === id);
        if (cachedTask) return cachedTask;
      }
      
      const response = await api.get(`/api/pending-tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching pending task ${id}:`, error);
      throw error;
    }
  },

  // Skapa en ny väntande uppgift
  createPendingTask: async (taskData) => {
    try {
      // Skapa uppgiften i databasen först
      const response = await api.post('/api/pending-tasks', taskData);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera cachen
      if (response.data) {
        addToCache(CACHE_KEYS.PENDING_TASKS, response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating pending task:', error);
      throw error;
    }
  },

  // Uppdatera en väntande uppgift
  updatePendingTask: async (id, taskData) => {
    try {
      // Uppdatera i databasen först
      const cleanedId = cleanId(id);
      const response = await api.patch(`/api/pending-tasks/${cleanedId}`, taskData);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera cachen
      if (response.data) {
        updateInCache(CACHE_KEYS.PENDING_TASKS, id, response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error updating pending task ${id}:`, error);
      throw error;
    }
  },

  // Ta bort en väntande uppgift
  deletePendingTask: async (id) => {
    try {
      // Ta bort från databasen först
      const cleanedId = cleanId(id);
      await api.delete(`/api/pending-tasks/${cleanedId}`);
      
      // Om borttagningen lyckades, uppdatera cachen
      removeFromCache(CACHE_KEYS.PENDING_TASKS, id);
    } catch (error) {
      console.error(`Error deleting pending task ${id}:`, error);
      throw error;
    }
  },

  // Godkänn en väntande uppgift
  approvePendingTask: async (id, approvalData) => {
    try {
      // Uppdatera i databasen först
      const cleanedId = cleanId(id);
      const response = await api.post(`/api/pending-tasks/${cleanedId}/approve`, approvalData);
      
      // Om databasen uppdaterades framgångsrikt, uppdatera båda cacherna
      if (response.data) {
        removeFromCache(CACHE_KEYS.PENDING_TASKS, id);
        addToCache(CACHE_KEYS.TASKS, response.data.task);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error approving pending task ${id}:`, error);
      throw error;
    }
  },

  // Avvisa en väntande uppgift
  rejectPendingTask: async (id, rejectionReason) => {
    try {
      // Uppdatera i databasen först
      const cleanedId = cleanId(id);
      const response = await api.post(`/api/pending-tasks/${cleanedId}/reject`, { reason: rejectionReason });
      
      // Om databasen uppdaterades framgångsrikt, uppdatera cachen
      if (response.data) {
        removeFromCache(CACHE_KEYS.PENDING_TASKS, id);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error rejecting pending task ${id}:`, error);
      throw error;
    }
  },

  // Hämta väntande uppgifter för en specifik lägenhet
  getPendingTasksByApartment: async (apartmentId) => {
    try {
      // Försök hitta i cachen först
      const cachedTasks = getFromCache(CACHE_KEYS.PENDING_TASKS);
      if (cachedTasks) {
        return cachedTasks.filter(task => task.apartmentId === apartmentId);
      }
      
      const response = await api.get(`/api/pending-tasks/apartment/${apartmentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching pending tasks for apartment ${apartmentId}:`, error);
      throw error;
    }
  },

  // Hämta väntande uppgifter för en specifik användare
  getPendingTasksByUser: async (userId) => {
    try {
      // Försök hitta i cachen först
      const cachedTasks = getFromCache(CACHE_KEYS.PENDING_TASKS);
      if (cachedTasks) {
        return cachedTasks.filter(task => task.createdByUserId === userId);
      }
      
      const response = await api.get(`/api/pending-tasks/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching pending tasks for user ${userId}:`, error);
      throw error;
    }
  },

  // Hämta väntande uppgifter efter status
  getPendingTasksByStatus: async (status) => {
    try {
      // Försök hitta i cachen först
      const cachedTasks = getFromCache(CACHE_KEYS.PENDING_TASKS);
      if (cachedTasks) {
        return cachedTasks.filter(task => task.status === status);
      }
      
      const response = await api.get(`/api/pending-tasks/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching pending tasks with status ${status}:`, error);
      throw error;
    }
  },

  // Hämta antalet obehandlade uppgifter
  getUnreviewedCount: async (bypassCache = false) => {
    try {
      // Försök hämta från cache först
      if (!bypassCache) {
        const cachedCount = getFromCache(CACHE_KEYS.UNREVIEWED_COUNT);
        if (cachedCount !== null) return cachedCount;
      }
      
      // Hämta alla väntande uppgifter och räkna de som är obehandlade
      const tasks = await pendingTaskService.getAllPendingTasks(bypassCache);
      const count = tasks.filter(task => !task.reviewedBy).length;
      
      // Spara räkningen i cachen
      saveToCache(CACHE_KEYS.UNREVIEWED_COUNT, count);
      
      return count;
    } catch (error) {
      console.error('Error calculating unreviewed count:', error);
      // Om något går fel, returnera 0 istället för att kasta fel
      return 0;
    }
  },

  // Hämta alla obehandlade uppgifter
  getUnreviewedTasks: async (bypassCache = false) => {
    return fetchWithCache(
      '/api/pending-tasks/for-review',
      CACHE_KEYS.PENDING_TASKS,
      bypassCache,
      'obehandlad uppgift',
      api.get
    );
  },

  getForReview: async () => {
    return fetchWithCache(
      '/api/pending-tasks/for-review',
      CACHE_KEYS.PENDING_TASKS_FOR_REVIEW,
      false,
      'uppgift för granskning',
      api.get
    );
  },
  
  getApproved: async () => {
    return fetchWithCache(
      '/api/pending-tasks/approved', 
      CACHE_KEYS.PENDING_TASKS_APPROVED,
      false,
      'godkänd uppgift',
      api.get
    );
  },
  
  getEmailReports: async () => {
    return fetchWithCache(
      '/api/pending-tasks/email-reports',
      CACHE_KEYS.EMAIL_REPORTS,
      false,
      'e-postrapport',
      api.get
    );
  },
  
  checkEmails: async () => {
    try {
      const response = await api.post('/api/pending-tasks/check-emails');
      // Invalidera cache för e-postrapporter vid manuell kontroll
      invalidateCache(CACHE_KEYS.EMAIL_REPORTS);
      return response.data;
    } catch (error) {
      console.error('Error checking email reports:', error);
      throw error;
    }
  }
};

export default pendingTaskService; 