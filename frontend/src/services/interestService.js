import api from './api';
import { getFromCache, saveToCache, CACHE_KEYS } from '../utils/cacheManager';

export const interestService = {
  getAll: async () => {
    try {
      const response = await api.get('/api/interests');
      return response.data;
    } catch (error) {
      console.error('Error fetching interests:', error);
      throw error;
    }
  },
  
  getForReview: async () => {
    try {
      const response = await api.get('/api/interests/for-review');
      return response.data;
    } catch (error) {
      console.error('Error fetching interests for review:', error);
      throw error;
    }
  },
  
  getReviewed: async () => {
    try {
      const response = await api.get('/api/interests/reviewed');
      return response.data;
    } catch (error) {
      console.error('Error fetching reviewed interests:', error);
      throw error;
    }
  },
  
  getUnreviewedCount: async (skipCache = false) => {
    try {
      const url = skipCache 
        ? `/api/interests/unreview-count?t=${new Date().getTime()}` 
        : '/api/interests/unreview-count';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching unreviewed interests count:', error);
      throw error;
    }
  },
  
  reviewInterest: async (id, reviewData) => {
    try {
      const response = await api.post(`/api/interests/${id}/review`, reviewData);
      return response.data;
    } catch (error) {
      console.error(`Error reviewing interest ${id}:`, error);
      throw error;
    }
  },
  
  rejectInterest: async (id, rejectData) => {
    try {
      const response = await api.post(`/api/interests/${id}/reject`, rejectData);
      return response.data;
    } catch (error) {
      console.error(`Error rejecting interest ${id}:`, error);
      throw error;
    }
  }
}; 