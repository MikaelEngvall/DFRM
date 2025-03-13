import api from './api';
import { getFromCache, saveToCache, invalidateCache, CACHE_KEYS } from '../utils/cacheManager';

export const getAllUsers = async (bypassCache = false) => {
  try {
    // Kontrollera om data finns i cache och om vi inte explicit vill gå förbi cachen
    if (!bypassCache) {
      const cachedData = getFromCache(CACHE_KEYS.USERS);
      if (cachedData) return cachedData;
    }
    
    // Hämta data från API om det inte finns i cache eller om vi vill gå förbi cachen
    const response = await api.get('/api/users');
    
    // Spara den nya datan i cache
    saveToCache(CACHE_KEYS.USERS, response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    // Försök hitta användaren i cachen först
    const cachedUsers = getFromCache(CACHE_KEYS.USERS);
    if (cachedUsers) {
      const cachedUser = cachedUsers.find(user => user.id === id);
      if (cachedUser) return cachedUser;
    }
    
    // Om den inte finns i cache, hämta från API
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/api/users', userData);
    
    // Invalidera användarcachen eftersom vi lagt till en ny användare
    invalidateCache(CACHE_KEYS.USERS);
    
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await api.patch(`/api/users/${id}`, userData);
    
    // Invalidera användarcachen eftersom vi uppdaterat en användare
    invalidateCache(CACHE_KEYS.USERS);
    
    return response.data;
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/api/users/${id}`);
    
    // Invalidera användarcachen eftersom vi tagit bort en användare
    invalidateCache(CACHE_KEYS.USERS);
    
    return response.data;
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    throw error;
  }
};

export const updatePassword = async (id, passwordData) => {
  try {
    const response = await api.patch(`/api/users/${id}/password`, passwordData);
    return response.data;
  } catch (error) {
    console.error(`Error updating password for user with ID ${id}:`, error);
    throw error;
  }
};

const userService = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updatePassword
};

export default userService; 