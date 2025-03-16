import api from './api';
import { getFromCache, saveToCache, addToCache, updateInCache, removeFromCache, CACHE_KEYS } from '../utils/cacheManager';

// Lägg till sökparametrar till alla förfrågningar
const withQueryParams = (params) => {
  if (!params) return '';
  
  const queryParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  return queryParams ? `?${queryParams}` : '';
};

const getAllTasks = async (params = {}, bypassCache = false) => {
  try {
    // Kontrollera om data finns i cache och om vi inte explicit vill gå förbi cachen
    if (!bypassCache) {
      const cachedData = getFromCache(CACHE_KEYS.TASKS);
      if (cachedData) return cachedData;
    }
    
    const response = await api.get('/api/tasks', { params });
    
    // Spara den nya datan i cache endast om API-anropet lyckades
    if (response.data) {
      saveToCache(CACHE_KEYS.TASKS, response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

const getTaskById = async (id) => {
  try {
    // Försök hitta uppgiften i cachen först
    const cachedTasks = getFromCache(CACHE_KEYS.TASKS);
    if (cachedTasks) {
      const cachedTask = cachedTasks.find(task => task.id === id);
      if (cachedTask) return cachedTask;
    }
    
    const response = await api.get(`/api/tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching task with ID ${id}:`, error);
    throw error;
  }
};

const createTask = async (taskData) => {
  try {
    // Skapa uppgiften i databasen först
    const response = await api.post('/api/tasks', taskData);
    
    // Om databasen uppdaterades framgångsrikt, uppdatera cachen
    if (response.data) {
      addToCache(CACHE_KEYS.TASKS, response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

const updateTask = async (id, taskData) => {
  try {
    // Uppdatera i databasen först
    const response = await api.patch(`/api/tasks/${id}`, taskData);
    
    // Om databasen uppdaterades framgångsrikt, uppdatera cachen
    if (response.data) {
      updateInCache(CACHE_KEYS.TASKS, id, response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error updating task with ID ${id}:`, error);
    throw error;
  }
};

const deleteTask = async (id) => {
  try {
    // Ta bort från databasen först
    await api.delete(`/api/tasks/${id}`);
    
    // Om borttagningen lyckades, uppdatera cachen
    removeFromCache(CACHE_KEYS.TASKS, id);
  } catch (error) {
    console.error(`Error deleting task with ID ${id}:`, error);
    throw error;
  }
};

const updateTaskStatus = async (id, status) => {
  try {
    // Uppdatera i databasen först
    const response = await api.patch(`/api/tasks/${id}/status`, { status });
    
    // Om databasen uppdaterades framgångsrikt, uppdatera cachen
    if (response.data) {
      updateInCache(CACHE_KEYS.TASKS, id, response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error updating status for task ${id}:`, error);
    throw error;
  }
};

const getTasksByAssignedUser = async (userId, bypassCache = false) => {
  try {
    // Kontrollera om data finns i cache och om vi inte explicit vill gå förbi cachen
    if (!bypassCache) {
      const cachedTasks = getFromCache(CACHE_KEYS.TASKS);
      if (cachedTasks) {
        return cachedTasks.filter(task => task.assignedToUserId === userId);
      }
    }
    
    const response = await api.get(`/api/tasks/assigned/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tasks for user ${userId}:`, error);
    throw error;
  }
};

const getTasksByApartment = async (apartmentId, bypassCache = false) => {
  try {
    // Försök hitta i cachen först
    const cachedTasks = getFromCache(CACHE_KEYS.TASKS);
    if (cachedTasks) {
      return cachedTasks.filter(task => task.apartmentId === apartmentId);
    }
    
    const response = await api.get(`/api/tasks/apartment/${apartmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tasks for apartment ${apartmentId}:`, error);
    throw error;
  }
};

const getTasksByTenant = async (tenantId, bypassCache = false) => {
  try {
    // Försök hitta i cachen först
    const cachedTasks = getFromCache(CACHE_KEYS.TASKS);
    if (cachedTasks) {
      return cachedTasks.filter(task => task.assignedToUserId === tenantId);
    }
    
    const response = await api.get(`/api/tasks/tenant/${tenantId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tasks for tenant ${tenantId}:`, error);
    throw error;
  }
};

const getTasksByDateRange = async (startDate, endDate, bypassCache = false) => {
  try {
    // Kontrollera om data finns i cache och om vi inte explicit vill gå förbi cachen
    if (!bypassCache) {
      const cachedTasks = getFromCache(CACHE_KEYS.TASKS);
      if (cachedTasks) {
        return cachedTasks.filter(task => {
          const taskDate = new Date(task.dueDate);
          return taskDate >= startDate && taskDate <= endDate;
        });
      }
    }
    
    const response = await api.get('/api/tasks/date-range', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks by date range:', error);
    throw error;
  }
};

const getTasksByStatus = async (status, bypassCache = false) => {
  try {
    // Försök hitta i cachen först
    const cachedTasks = getFromCache(CACHE_KEYS.TASKS);
    if (cachedTasks) {
      return cachedTasks.filter(task => task.status === status);
    }
    
    const response = await api.get(`/api/tasks/status/${status}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tasks with status ${status}:`, error);
    throw error;
  }
};

const getOverdueTasks = async (bypassCache = false) => {
  try {
    // Kontrollera om data finns i cache och om vi inte explicit vill gå förbi cachen
    if (!bypassCache) {
      const cachedTasks = getFromCache(CACHE_KEYS.TASKS);
      if (cachedTasks) {
        const today = new Date();
        return cachedTasks.filter(task => {
          const dueDate = new Date(task.dueDate);
          return dueDate < today && task.status !== 'COMPLETED';
        });
      }
    }
    
    const response = await api.get('/api/tasks/overdue');
    return response.data;
  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    throw error;
  }
};

// För återkommande uppgifter
const createRecurringTask = async (taskData) => {
  try {
    const response = await api.post('/api/tasks/recurring', taskData);
    
    // Invalidera cachen för uppgifter eftersom vi lagt till en ny
    removeFromCache(CACHE_KEYS.TASKS);
    
    return response.data;
  } catch (error) {
    console.error('Error creating recurring task:', error);
    throw error;
  }
};

const updateRecurringPattern = async (id, pattern) => {
  try {
    const response = await api.patch(`/api/tasks/${id}/recurring`, pattern);
    
    // Invalidera cachen för uppgifter eftersom vi uppdaterat en
    removeFromCache(CACHE_KEYS.TASKS);
    
    return response.data;
  } catch (error) {
    console.error(`Error updating recurring pattern for task ${id}:`, error);
    throw error;
  }
};

const taskService = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getTasksByAssignedUser,
  getTasksByApartment,
  getTasksByTenant,
  getTasksByDateRange,
  getTasksByStatus,
  getOverdueTasks,
  createRecurringTask,
  updateRecurringPattern
};

export default taskService; 