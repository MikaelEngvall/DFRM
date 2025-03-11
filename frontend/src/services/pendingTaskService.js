import axios from './api';

const getAll = async () => {
  try {
    const response = await axios.get('/api/pending-tasks');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending tasks:', error);
    throw error;
  }
};

const getById = async (id) => {
  try {
    const response = await axios.get(`/api/pending-tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching pending task ${id}:`, error);
    throw error;
  }
};

const getUnreviewedCount = async () => {
  try {
    const response = await axios.get('/api/pending-tasks/unreview-count');
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
    return response.data;
  } catch (error) {
    console.error(`Error approving pending task ${pendingTaskId}:`, error);
    throw error;
  }
};

const rejectPendingTask = async (pendingTaskId, reviewData) => {
  try {
    const response = await axios.post(`/api/pending-tasks/${pendingTaskId}/reject`, reviewData);
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