import api from './api';
import { getFromCache, saveToCache, addToCache, updateInCache, removeFromCache, CACHE_KEYS } from '../utils/cacheManager';

const getAllTasks = async (bypassCache = false) => {
  try {
    console.log(`getAllTasks anropat med bypassCache=${bypassCache}`);
    
    // Kontrollera om data finns i cachen och om vi inte vill gå förbi den
    if (!bypassCache) {
      const cachedTasks = getFromCache(CACHE_KEYS.TASKS);
      if (cachedTasks) {
        console.log(`Returnerar ${cachedTasks.length} uppgifter från cache`);
        return cachedTasks;
      }
    } else {
      console.log('Tvingad att gå förbi cachen och hämta från API');
    }
    
    console.log('Hämtar alla uppgifter från API');
    const response = await api.get('/api/tasks');
    console.log(`API returnerade ${response.data.length} uppgifter`);
    
    // Normalisera datumsformatet för alla uppgifter
    const normalizedTasks = response.data.map(task => {
      if (!task.dueDate) return task;
      
      try {
        // Kontrollera datumformatet
        if (typeof task.dueDate === 'string') {
          // Vi behåller datumet som det är, men ser till att det är i YYYY-MM-DD-format
          if (task.dueDate.includes('T')) {
            const dateObj = new Date(task.dueDate);
            task.dueDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
          }
        } else if (task.dueDate instanceof Date) {
          const dateObj = task.dueDate;
          task.dueDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        }
      } catch (e) {
        console.error('Fel vid normalisering av datum för uppgift:', e, task);
      }
      
      return task;
    });
    
    // Spara den nya datan i cache om vi inte ska gå förbi den
    if (!bypassCache) {
      console.log(`Sparar ${normalizedTasks.length} uppgifter i cache`);
      saveToCache(CACHE_KEYS.TASKS, normalizedTasks);
    }
    
    return normalizedTasks;
  } catch (error) {
    console.error('Error fetching all tasks:', error);
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
    
    console.log('updateTask anropad med ID:', id);
    console.log('och taskData:', taskData);
    
    if (fixedTaskData.dueDate) {
      // Garantera att datumet är i formatet "YYYY-MM-DD" utan tidsdel
      const dueDate = new Date(fixedTaskData.dueDate);
      const year = dueDate.getFullYear();
      const month = String(dueDate.getMonth() + 1).padStart(2, '0');
      const day = String(dueDate.getDate()).padStart(2, '0');
      fixedTaskData.dueDate = `${year}-${month}-${day}`;
    }
    
    // Säkerställ att ID:t ingår i datan som skickas
    fixedTaskData.id = id;
    
    // Försök med PUT istället för PATCH då det kan vara problem med PATCH-behörigheter
    console.log(`PUT-anrop till /api/tasks/${id} med data:`, fixedTaskData);
    
    // Använd PUT istället för PATCH
    const response = await api.put(`/api/tasks/${id}`, fixedTaskData);
    
    console.log('PUT-svar:', response.data);
    
    // Om databasen uppdaterades framgångsrikt, uppdatera cachen
    if (response.data) {
      updateInCache(CACHE_KEYS.TASKS, id, response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error updating task with ID ${id}:`, error);
    console.error('Anropsdata:', taskData);
    console.error('API-svar:', error.response?.data);
    
    // Om PUT också misslyckas, försök med vanligt PATCH som backup
    try {
      console.log('PUT misslyckades, försöker med PATCH som backup...');
      const fixedTaskData = { ...taskData, id: id };
      const response = await api.patch(`/api/tasks/${id}`, fixedTaskData);
      
      if (response.data) {
        updateInCache(CACHE_KEYS.TASKS, id, response.data);
      }
      
      return response.data;
    } catch (patchError) {
      console.error('Båda PUT och PATCH misslyckades:', patchError);
      throw error; // Kasta det ursprungliga felet
    }
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
    
    console.log(`Formaterade datum: startDate=${formattedStartDate}, endDate=${formattedEndDate}`);
    
    // Kontrollera om data finns i cache och om vi inte explicit vill gå förbi cachen
    if (!bypassCache) {
      const cachedTasks = getFromCache(CACHE_KEYS.TASKS);
      if (cachedTasks) {
        console.log(`Hämtar uppgifter från cache (${cachedTasks.length} uppgifter)`);
        
        // Konvertera sträng-datumen till Date-objekt för att jämförelsen ska fungera
        const startDateObj = new Date(formattedStartDate);
        const endDateObj = new Date(formattedEndDate);
        
        // För att hantera datum i olika format, sätt tidsdelen till midnatt
        startDateObj.setHours(0, 0, 0, 0);
        endDateObj.setHours(23, 59, 59, 999); // Slutet av dagen
        
        console.log(`Datumintervall för filtrering: ${startDateObj.toISOString()} till ${endDateObj.toISOString()}`);
        
        const filteredTasks = cachedTasks.filter(task => {
          if (!task.dueDate) {
            return false;
          }
          
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
            
            // Logg för att debugga datum-jämförelse (för första 5 uppgifterna)
            if (filteredTasks.length < 5) {
              console.log(`Uppgift ${task.id || 'unknown'}: dueDate=${task.dueDate}, parsed=${taskDate.toISOString()}, in range=${taskDate >= startDateObj && taskDate <= endDateObj}`);
            }
            
            return taskDate >= startDateObj && taskDate <= endDateObj;
          } catch (e) {
            console.error('Fel vid bearbetning av uppgiftsdatum:', e, task);
            return false;
          }
        });
        
        console.log(`Filtrerade ${filteredTasks.length} uppgifter från cache för tidsperioden.`);
        if (filteredTasks.length > 0) {
          console.log('Exempel på filtrerade uppgifter:', filteredTasks.slice(0, 3));
        }
        
        return filteredTasks;
      } else {
        console.log('Inga uppgifter i cache, anropar API.');
      }
    } else {
      console.log('bypassCache=true, anropar API direkt.');
    }
    
    console.log(`Anropar API med datum: ${formattedStartDate} till ${formattedEndDate}`);
    
    // Ändra anropsmetoden för att använda allmänna /api/tasks-endpointen istället
    // Eftersom date-range-endpointen verkar vara felaktig eller inte fungera ordentligt
    try {
      console.log('Försöker hämta alla uppgifter och filtrera dem lokalt');
      const allTasksResponse = await api.get('/api/tasks');
      console.log(`API-svar med ${allTasksResponse.data.length} uppgifter totalt.`);
      
      // Filtrera uppgifterna lokalt baserat på dueDate
      const startDateObj = new Date(formattedStartDate);
      const endDateObj = new Date(formattedEndDate);
      startDateObj.setHours(0, 0, 0, 0);
      endDateObj.setHours(23, 59, 59, 999);
      
      const filteredTasks = allTasksResponse.data.filter(task => {
        if (!task.dueDate) return false;
        
        try {
          let taskDate;
          if (typeof task.dueDate === 'string') {
            if (task.dueDate.includes('T')) {
              taskDate = new Date(task.dueDate);
            } else {
              const [y, m, d] = task.dueDate.split('-').map(Number);
              taskDate = new Date(y, m - 1, d);
            }
          } else if (task.dueDate instanceof Date) {
            taskDate = task.dueDate;
          } else {
            return false;
          }
          
          taskDate.setHours(0, 0, 0, 0);
          
          return taskDate >= startDateObj && taskDate <= endDateObj;
        } catch (e) {
          console.error('Fel vid filtrering av datum:', e);
          return false;
        }
      });
      
      console.log(`Filtrerade fram ${filteredTasks.length} uppgifter från API-svaret för datumintervallet`);
      
      // Om vi kunde filtrera fram några uppgifter, använd dem
      if (filteredTasks.length > 0) {
        const normalizedTasks = filteredTasks.map(task => {
          if (!task.dueDate) return task;
          
          try {
            // Kontrollera datumformatet
            if (typeof task.dueDate === 'string') {
              // Vi behåller datumet som det är, men ser till att det är i YYYY-MM-DD-format
              if (task.dueDate.includes('T')) {
                const dateObj = new Date(task.dueDate);
                task.dueDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
              }
            } else if (task.dueDate instanceof Date) {
              const dateObj = task.dueDate;
              task.dueDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
            }
          } catch (e) {
            console.error('Fel vid normalisering av datum för uppgift:', e, task);
          }
          
          return task;
        });
        
        // Spara i cachen
        if (normalizedTasks && !bypassCache) {
          saveToCache(CACHE_KEYS.TASKS, normalizedTasks);
        }
        
        return normalizedTasks;
      }
    } catch (err) {
      console.error('Fel vid hämtning av alla uppgifter:', err);
    }
    
    // Fallback: Försök med det ursprungliga date-range API-anropet
    console.log('Fallback: Provar ursprungliga date-range API-anropet');
    const response = await api.get('/api/tasks/date-range', {
      params: { startDate: formattedStartDate, endDate: formattedEndDate }
    });
    
    console.log(`API-svar med ${response.data.length} uppgifter.`);
    if (response.data.length > 0) {
      console.log('Exempel på uppgifter från API:', response.data.slice(0, 3));
    } else {
      console.warn('API returnerade inga uppgifter för det angivna datumintervallet.');
    }
    
    // Normalisera datumsformatet för alla uppgifter
    const normalizedTasks = response.data.map(task => {
      if (!task.dueDate) return task;
      
      try {
        // Kontrollera datumformatet
        if (typeof task.dueDate === 'string') {
          // Vi behåller datumet som det är, men ser till att det är i YYYY-MM-DD-format
          if (task.dueDate.includes('T')) {
            const dateObj = new Date(task.dueDate);
            task.dueDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
          }
        } else if (task.dueDate instanceof Date) {
          const dateObj = task.dueDate;
          task.dueDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        }
      } catch (e) {
        console.error('Fel vid normalisering av datum för uppgift:', e, task);
      }
      
      return task;
    });
    
    console.log(`Antal uppgifter efter normalisering: ${normalizedTasks.length}`);
    
    // Spara den nya datan i cache
    if (normalizedTasks && !bypassCache) {
      console.log(`Sparar ${normalizedTasks.length} uppgifter i cache.`);
      saveToCache(CACHE_KEYS.TASKS, normalizedTasks);
    }
    
    return normalizedTasks;
  } catch (error) {
    console.error('Error fetching tasks by date range:', error);
    console.error('API URL:', '/api/tasks/date-range', 'Params:', { startDate, endDate });
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