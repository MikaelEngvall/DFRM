import api from './api';

export const getAllAdmins = async () => {
  try {
    const response = await api.get('/api/admins');
    return response.data;
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};

export const getAdminById = async (id) => {
  try {
    const response = await api.get(`/api/admins/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching admin with ID ${id}:`, error);
    throw error;
  }
};

export const createAdmin = async (adminData) => {
  try {
    const response = await api.post('/api/admins', adminData);
    return response.data;
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
};

export const updateAdmin = async (id, adminData) => {
  try {
    const response = await api.put(`/api/admins/${id}`, adminData);
    return response.data;
  } catch (error) {
    console.error(`Error updating admin with ID ${id}:`, error);
    throw error;
  }
};

export const deleteAdmin = async (id) => {
  try {
    const response = await api.delete(`/api/admins/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting admin with ID ${id}:`, error);
    throw error;
  }
};

export const updatePassword = async (id, passwordData) => {
  try {
    const response = await api.patch(`/api/admins/${id}/password`, passwordData);
    return response.data;
  } catch (error) {
    console.error(`Error updating password for admin with ID ${id}:`, error);
    throw error;
  }
};

const adminService = {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  updatePassword
};

export default adminService; 