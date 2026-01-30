// API Base URL
export const API_BASE_URL = 'http://localhost:8090/api/v1';

// Constants
export const VEHICLE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  OWNER: 'owner',
  CUSTOMER: 'customer',
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

export const ROUTES = {
  LOGIN: '/admin/login',
  DASHBOARD: '/admin/dashboard',
  VEHICLE_MANAGEMENT: '/admin/vehicles',
  BOOKINGS: '/admin/bookings',
  USERS: '/admin/users',
  REPORTS: '/admin/reports',
  SETTINGS: '/admin/settings',
};

// Helper function to get JWT token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API requests using fetch
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
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
      window.location.href = '/admin/login';
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

// Vehicle API
export const vehicleAPI = {
  getAllVehicles: async () => {
    try {
      const data = await apiRequest('/vehicle', { method: 'GET' });
      return data;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      return { vehicles: [] };
    }
  },

  getVehicleById: async (id) => {
    try {
      const data = await apiRequest(`/vehicle/${id}`, { method: 'GET' });
      return data;
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      throw error;
    }
  },

  createVehicle: async (vehicleData) => {
    try {
      const data = await apiRequest('/vehicle/create', {
        method: 'POST',
        body: vehicleData,
      });
      return data;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  },

  deleteVehicle: async (id) => {
    try {
      const data = await apiRequest(`/vehicle/delete/${id}`, { method: 'DELETE' });
      return data;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  },

  updateVehicleStatus: async (id, status) => {
    try {
      const data = await apiRequest(`/vehicle/status/${id}`, {
        method: 'PATCH',
        body: { status },
      });
      return data;
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      throw error;
    }
  },
};

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      const data = await apiRequest('/authUser/login', {
        method: 'POST',
        body: credentials,
      });
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const data = await apiRequest('/authUser/logout', { method: 'POST' });
      return data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  getUserDetails: async () => {
    try {
      const data = await apiRequest('/authUser/getUserDetails', { method: 'GET' });
      return data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  },
};

// Notification API
export const notificationAPI = {
  getMyNotifications: async () => {
    try {
      const data = await apiRequest('/notification/me', { method: 'GET' });
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { notifications: [] };
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const data = await apiRequest(`/notification/read/${notificationId}`, {
        method: 'PUT',
      });
      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
};