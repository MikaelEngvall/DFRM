import api from './api';
import { getFromCache, saveToCache, addToCache, updateInCache, removeFromCache, CACHE_KEYS } from '../utils/cacheManager';

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
    // Fixera tidzonsproblem innan vi skickar till backend
    const fixedTaskData = { ...taskData };
    
    if (fixedTaskData.dueDate) {
      // Garantera att datumet är i formatet "YYYY-MM-DD" utan tidsdel
      const dueDate = new Date(fixedTaskData.dueDate);
      const year = dueDate.getFullYear();
      const month = String(dueDate.getMonth() + 1).padStart(2, '0');
      const day = String(dueDate.getDate()).padStart(2, '0');
      fixedTaskData.dueDate = `${year}-${month}-${day}`;
    }
    
    // Skapa uppgiften i databasen först
    const response = await api.post('/api/tasks', fixedTaskData);
    
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
    // Fixera tidzonsproblem innan vi skickar till backend
    const fixedTaskData = { ...taskData };
    
    if (fixedTaskData.dueDate) {
      // Garantera att datumet är i formatet "YYYY-MM-DD" utan tidsdel
      const dueDate = new Date(fixedTaskData.dueDate);
      const year = dueDate.getFullYear();
      const month = String(dueDate.getMonth() + 1).padStart(2, '0');
      const day = String(dueDate.getDate()).padStart(2, '0');
      fixedTaskData.dueDate = `${year}-${month}-${day}`;
    }
    
    // Uppdatera i databasen först
    const response = await api.patch(`/api/tasks/${id}`, fixedTaskData);
    
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
    console.log(`getTasksByDateRange anropat med: startDate=${startDate}, endDate=${endDate}, bypassCache=${bypassCache}`);
    
    // Formatera datum om de inte redan är korrekt formaterade
    const formattedStartDate = typeof startDate === 'string' ? startDate : new Date(startDate).toISOString().split('T')[0];
    const formattedEndDate = typeof endDate === 'string' ? endDate : new Date(endDate).toISOString().split('T')[0];
    
    // Kontrollera om data finns i cache och om vi inte explicit vill gå förbi cachen
    if (!bypassCache) {
      const cachedTasks = getFromCache(CACHE_KEYS.TASKS);
      if (cachedTasks) {
        console.log('Hämtar uppgifter från cache:', cachedTasks.length);
        
        // Konvertera sträng-datumen till Date-objekt för att jämförelsen ska fungera
        const startDateObj = new Date(formattedStartDate);
        const endDateObj = new Date(formattedEndDate);
        
        // För att hantera datum i olika format, sätt tidsdelen till midnatt
        startDateObj.setHours(0, 0, 0, 0);
        endDateObj.setHours(23, 59, 59, 999); // Slutet av dagen
        
        const filteredTasks = cachedTasks.filter(task => {
          if (!task.dueDate) return false;
          
          try {
            // Konvertera task.dueDate till endast datum (utan tid)
            let taskDate;
            if (typeof task.dueDate === 'string') {
              // Hantera både "YYYY-MM-DD" och ISO-format
              if (task.dueDate.includes('T')) {
                taskDate = new Date(task.dueDate);
              } else {
                const [y, m, d] = task.dueDate.split('-').map(Number);
                taskDate = new Date(y, m - 1, d); // Månad är 0-baserad
              }
            } else if (task.dueDate instanceof Date) {
              taskDate = task.dueDate;
            } else {
              console.error('Uppgift har ogiltigt datumformat:', task);
              return false;
            }
            
            taskDate.setHours(0, 0, 0, 0); // Sätt tid till midnatt för att jämföra endast datum
            
            return taskDate >= startDateObj && taskDate <= endDateObj;
          } catch (e) {
            console.error('Fel vid bearbetning av uppgiftsdatum:', e, task);
            return false;
          }
        });
        
        console.log(`Filtrerade ${filteredTasks.length} uppgifter från cache.`);
        return filteredTasks;
      }
    }
    
    console.log(`Anropar API med datum: ${formattedStartDate} till ${formattedEndDate}`);
    const response = await api.get('/api/tasks/date-range', {
      params: { startDate: formattedStartDate, endDate: formattedEndDate }
    });
    
    console.log(`API-svar med ${response.data.length} uppgifter.`);
    
    // Spara den nya datan i cache
    if (response.data && !bypassCache) {
      saveToCache(CACHE_KEYS.TASKS, response.data);
    }
    
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

export const updateRecurringPattern = async (id, pattern) => {
  try {
    const response = await api.patch(`/api/tasks/${id}/recurring`, { pattern });
    // Uppdatera cache om det behövs
    return response.data;
  } catch (error) {
    console.error(`Error updating recurring pattern for task ${id}: `, error);
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