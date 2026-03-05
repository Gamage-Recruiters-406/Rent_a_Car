// services/bookingAvailability.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION || '/api/v1';

const api = axios.create({
  baseURL: `${BASE_URL}${API_VERSION}`,
  timeout: 30000, // 30 seconds timeout for mobile
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Clear invalid token
        await AsyncStorage.multiRemove([
          'userToken',
          'userId',
          'userRole',
          'userStatus',
        ]);
        console.log('Session expired. Please login again.');
      } catch (clearError) {
        console.error('Error clearing session:', clearError);
      }
    }

    return Promise.reject(error);
  },
);

/**
 * Get vehicle availability
 */
export const getVehicleAvailability = async (vehicleId) => {
  try {
    const response = await api.get(`/bookings/availability/${vehicleId}`);
    return response.data; // { success, data: bookings[] }
  } catch (error) {
    console.error('Get vehicle availability error:', error);
    throw error.response?.data || { message: error.message || 'Network error' };
  }
};

/**
 * Create owner personal use booking (block dates)
 */
export const createOwnerPersonalUseBooking = async (data) => {
  try {
    const response = await api.post('/bookings/owner/personal-use', data);
    return response.data;
  } catch (error) {
    console.error('Create owner personal use booking error:', error);
    throw error.response?.data || { message: error.message || 'Network error' };
  }
};

// Default export for convenience
export default {
  getVehicleAvailability,
  createOwnerPersonalUseBooking,
};