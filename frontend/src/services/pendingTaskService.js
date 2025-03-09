import api from './api';

export const getAllPendingTasks = async () => {
  try {
    const response = await api.get('/api/pending-tasks');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending tasks:', error);
    throw error;
  }
};

export const getPendingTaskById = async (id) => {
  try {
    const response = await api.get(`/api/pending-tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching pending task with id ${id}:`, error);
    throw error;
  }
};

export const getPendingTasksByRequestedBy = async (userId) => {
  try {
    const response = await api.get(`/api/pending-tasks/requested-by/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching pending tasks for user with id ${userId}:`, error);
    throw error;
  }
};

export const getPendingTasksForReview = async () => {
  try {
    const response = await api.get('/api/pending-tasks/for-review');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending tasks for review:', error);
    throw error;
  }
};

export const createPendingTask = async (taskData, requestedById, comments) => {
  try {
    const payload = {
      task: taskData,
      requestedById,
      comments
    };
    const response = await api.post('/api/pending-tasks', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating pending task:', error);
    throw error;
  }
};

export const approvePendingTask = async (id, reviewedById, comments) => {
  try {
    const payload = {
      reviewedById,
      comments
    };
    const response = await api.post(`/api/pending-tasks/${id}/approve`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error approving pending task with id ${id}:`, error);
    throw error;
  }
};

export const rejectPendingTask = async (id, reviewedById, comments) => {
  try {
    const payload = {
      reviewedById,
      comments
    };
    const response = await api.post(`/api/pending-tasks/${id}/reject`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error rejecting pending task with id ${id}:`, error);
    throw error;
  }
};

export const deletePendingTask = async (id) => {
  try {
    const response = await api.delete(`/api/pending-tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting pending task with id ${id}:`, error);
    throw error;
  }
};

const pendingTaskService = {
  getAllPendingTasks,
  getPendingTaskById,
  getPendingTasksByRequestedBy,
  getPendingTasksForReview,
  createPendingTask,
  approvePendingTask,
  rejectPendingTask,
  deletePendingTask
};

export default pendingTaskService; 