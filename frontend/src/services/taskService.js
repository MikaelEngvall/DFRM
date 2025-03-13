import api from './api';
import { getFromCache, saveToCache, invalidateCache, CACHE_KEYS } from '../utils/cacheManager';

// Lägg till sökparametrar till alla förfrågningar
const withQueryParams = (params) => {
  if (!params) return '';
  
  const queryParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  return queryParams ? `?${queryParams}` : '';
};

export const getAllTasks = async (params, bypassCache = false) => {
  try {
    // Om det finns parametrar eller vi explicit vill gå förbi cachen, hämta från API
    if (params || bypassCache) {
      const response = await api.get(`/api/tasks${withQueryParams(params)}`);
      return response.data;
    }
    
    // Kontrollera om data finns i cache
    const cachedData = getFromCache(CACHE_KEYS.TASKS);
    if (cachedData) return cachedData;
    
    // Hämta data från API om det inte finns i cache
    const response = await api.get('/api/tasks');
    
    // Spara den nya datan i cache
    saveToCache(CACHE_KEYS.TASKS, response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const getTaskById = async (id) => {
  try {
    // Försök hitta uppgiften i cachen först
    const cachedTasks = getFromCache(CACHE_KEYS.TASKS);
    if (cachedTasks) {
      const cachedTask = cachedTasks.find(task => task.id === id);
      if (cachedTask) return cachedTask;
    }
    
    // Om den inte finns i cache, hämta från API
    const response = await api.get(`/api/tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching task with ID ${id}:`, error);
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await api.post('/api/tasks', taskData);
    
    // Invalidera cachen för uppgifter eftersom vi lagt till en ny
    invalidateCache(CACHE_KEYS.TASKS);
    
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (id, taskData) => {
  try {
    const response = await api.patch(`/api/tasks/${id}`, taskData);
    
    // Invalidera cachen för uppgifter eftersom vi uppdaterat en
    invalidateCache(CACHE_KEYS.TASKS);
    
    return response.data;
  } catch (error) {
    console.error(`Error updating task with ID ${id}:`, error);
    throw error;
  }
};

export const deleteTask = async (id) => {
  try {
    const response = await api.delete(`/api/tasks/${id}`);
    
    // Invalidera cachen för uppgifter eftersom vi tagit bort en
    invalidateCache(CACHE_KEYS.TASKS);
    
    return response.data;
  } catch (error) {
    console.error(`Error deleting task with ID ${id}:`, error);
    throw error;
  }
};

export const updateTaskStatus = async (id, status) => {
  try {
    const response = await api.patch(`/api/tasks/${id}/status`, { status });
    
    // Invalidera cachen för uppgifter eftersom vi uppdaterat en
    invalidateCache(CACHE_KEYS.TASKS);
    
    return response.data;
  } catch (error) {
    console.error(`Error updating status for task with ID ${id}:`, error);
    throw error;
  }
};

export const getTasksByAssignedUser = async (userId) => {
  try {
    const response = await api.get(`/api/tasks/assigned/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tasks for user with ID ${userId}:`, error);
    throw error;
  }
};

export const getTasksByApartment = async (apartmentId) => {
  try {
    const response = await api.get(`/api/tasks/apartment/${apartmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tasks for apartment with ID ${apartmentId}:`, error);
    throw error;
  }
};

export const getTasksByTenant = async (tenantId) => {
  try {
    const response = await api.get(`/api/tasks/tenant/${tenantId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tasks for tenant with ID ${tenantId}:`, error);
    throw error;
  }
};

export const getTasksByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.get(`/api/tasks/date-range/${startDate}/${endDate}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks by date range:', error);
    throw error;
  }
};

export const getTasksByStatus = async (status) => {
  try {
    const response = await api.get(`/api/tasks/status/${status}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tasks with status ${status}:`, error);
    throw error;
  }
};

export const getOverdueTasks = async () => {
  try {
    const response = await api.get('/api/tasks/overdue');
    return response.data;
  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    throw error;
  }
};

// För återkommande uppgifter
export const createRecurringTask = async (taskData) => {
  try {
    const response = await api.post('/api/tasks/recurring', taskData);
    
    // Invalidera cachen för uppgifter eftersom vi lagt till en ny
    invalidateCache(CACHE_KEYS.TASKS);
    
    return response.data;
  } catch (error) {
    console.error('Error creating recurring task:', error);
    throw error;
  }
};

export const updateRecurringPattern = async (id, pattern) => {
  try {
    const response = await api.patch(`/api/tasks/${id}/recurring`, { recurringPattern: pattern });
    
    // Invalidera cachen för uppgifter eftersom vi uppdaterat en
    invalidateCache(CACHE_KEYS.TASKS);
    
    return response.data;
  } catch (error) {
    console.error(`Error updating recurring pattern for task with ID ${id}:`, error);
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