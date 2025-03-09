import api from './api';

// Lägg till sökparametrar till alla förfrågningar
const withQueryParams = (params) => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const getAllTasks = async (params) => {
  try {
    const queryString = withQueryParams(params);
    const response = await api.get(`/tasks${queryString}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const getTaskById = async (id) => {
  try {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching task with id ${id}:`, error);
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks', taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (id, taskData) => {
  try {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  } catch (error) {
    console.error(`Error updating task with id ${id}:`, error);
    throw error;
  }
};

export const deleteTask = async (id) => {
  try {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting task with id ${id}:`, error);
    throw error;
  }
};

export const updateTaskStatus = async (id, status) => {
  try {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating status for task with id ${id}:`, error);
    throw error;
  }
};

export const getTasksByAssignedUser = async (userId) => {
  try {
    const response = await api.get(`/tasks/assignedTo/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tasks for user with id ${userId}:`, error);
    throw error;
  }
};

export const getTasksByApartment = async (apartmentId) => {
  try {
    const response = await api.get(`/tasks/apartment/${apartmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tasks for apartment with id ${apartmentId}:`, error);
    throw error;
  }
};

export const getTasksByTenant = async (tenantId) => {
  try {
    const response = await api.get(`/tasks/tenant/${tenantId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tasks for tenant with id ${tenantId}:`, error);
    throw error;
  }
};

export const getTasksByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.get(`/tasks/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tasks between ${startDate} and ${endDate}:`, error);
    throw error;
  }
};

export const getTasksByStatus = async (status) => {
  try {
    const response = await api.get(`/tasks/status/${status}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tasks with status ${status}:`, error);
    throw error;
  }
};

export const getOverdueTasks = async () => {
  try {
    const response = await api.get('/tasks/overdue');
    return response.data;
  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    throw error;
  }
};

// För återkommande uppgifter
export const createRecurringTask = async (taskData) => {
  try {
    const response = await api.post('/tasks/recurring', taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating recurring task:', error);
    throw error;
  }
};

export const updateRecurringPattern = async (id, pattern) => {
  try {
    const response = await api.patch(`/tasks/${id}/recurring-pattern`, { pattern });
    return response.data;
  } catch (error) {
    console.error(`Error updating recurring pattern for task with id ${id}:`, error);
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