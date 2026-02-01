// src/services/vehicleService.js

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8090";
const API_VERSION = import.meta.env.VITE_API_VERSION || "/api/v1";

export const API_BASE_URL = `${BASE_URL}${API_VERSION}`;

// Constants
export const VEHICLE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Helper function to get auth token (centralized for reuse if needed)
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API requests using fetch
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();  // Now properly defined
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Parse JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Vehicle API - Admin
export const vehicleAPI = {
  // Get all vehicle listings - ADMIN
  // Backend: GET /vehicle/admin/get-all
  getAllVehicles: async () => {
    try {
      const data = await apiRequest('/vehicle/admin/get-all', { method: 'GET' });
      return data;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      return { vehicles: [] }; // Fallback for graceful degradation
    }
  },

  // Update vehicle status (Approve/Reject) - ADMIN
  // Backend: PATCH /vehicle/admin/status/:id
  updateVehicleStatus: async (id, status) => {
    try {
      const data = await apiRequest(`/vehicle/admin/status/${id}`, {
        method: 'PATCH',
        body: { status },
      });
      return data;
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      throw error;
    }
  },

  // Get single vehicle
  // Backend: GET /vehicle/get/:id
  getVehicleById: async (id) => {
    try {
      const data = await apiRequest(`/vehicle/get/${id}`, { method: 'GET' });
      return data;
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      throw error;
    }
  },

  // Delete vehicle
  // Backend: DELETE /vehicle/delete/:id
  deleteVehicle: async (id) => {
    try {
      const data = await apiRequest(`/vehicle/delete/${id}`, { method: 'DELETE' });
      return data;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  },
};