// src/services/bookingAvailability.js
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
 * Search for available vehicles
 */
export const searchVehicles = async (params) => {
  try {
    const response = await api.get('/bookings/vehicleSearch', { params });
    return response.data;
  } catch (error) {
    console.error('Search vehicles error:', error);
    throw error.response?.data || { message: error.message || 'Network error' };
  }
};

/**
 * Create a new booking
 */
export const createBooking = async (formData) => {
  try {
    // Handle FormData for React Native
    const formDataNative = new FormData();

    // Convert formData object to FormData
    Object.keys(formData).forEach((key) => {
      if (key === 'images' && Array.isArray(formData[key])) {
        // Handle multiple images
        formData[key].forEach((image, index) => {
          formDataNative.append('images', {
            uri: image.uri,
            type: image.type || 'image/jpeg',
            name: image.fileName || `image_${index}.jpg`,
          });
        });
      } else if (formData[key] !== null && formData[key] !== undefined) {
        formDataNative.append(key, formData[key]);
      }
    });

    const response = await api.post('/bookings/create', formDataNative, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Create booking error:', error);
    throw error.response?.data || { message: error.message || 'Network error' };
  }
};

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
 * Get all bookings for current user
 */
export const getAllBookings = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');

    console.log('Token exists in AsyncStorage:', !!token);
    console.log(
      'Token preview:',
      token ? `${token.substring(0, 20)}...` : 'null',
    );

    if (!token) {
      const error = new Error('No authentication token found. Please log in.');
      error.status = 401;
      throw error;
    }

    console.log('Making request to /bookings/get');
    const response = await api.get('/bookings/get');
    console.log('Bookings fetched successfully:', response.data);
    return response.data; // { success, data: bookings[] }
  } catch (error) {
    console.error(
      'Error in getAllBookings:',
      error.response?.status,
      error.response?.data,
    );

    // Handle 401 errors
    if (error.response?.status === 401) {
      console.log('401 error - clearing token from AsyncStorage');
      await AsyncStorage.multiRemove([
        'userToken',
        'userId',
        'userRole',
        'userStatus',
      ]);
    }

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

/**
 * Cancel a booking
 */
export const cancelBooking = async (bookingId) => {
  try {
    const response = await api.put(`/bookings/cancel/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Cancel booking error:', error);
    throw error.response?.data || { message: error.message || 'Network error' };
  }
};

/**
 * Update booking status (for owners)
 */
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await api.put(`/bookings/status/${bookingId}`, { status });
    return response.data;
  } catch (error) {
    console.error('Update booking status error:', error);
    throw error.response?.data || { message: error.message || 'Network error' };
  }
};

// Default export for convenience
export default {
  searchVehicles,
  createBooking,
  getVehicleAvailability,
  getAllBookings,
  createOwnerPersonalUseBooking,
  cancelBooking,
  updateBookingStatus,
};
