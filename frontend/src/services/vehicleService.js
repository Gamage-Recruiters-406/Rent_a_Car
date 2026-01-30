// API Base URL
export const API_BASE_URL = 'http://localhost:8090/api/v1';

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

export const vehicleAPI = {
  // Added /vehicles prefix to match backend mounting
  getAllVehicles: async () => {
    return await apiRequest('/admin/get-all');
  },

  getVehicleById: async (id) => {
    return await apiRequest(`/vehicles/get/${id}`);
  },

  updateVehicleStatus: async (id, status) => {
    return await apiRequest(`/vehicles/admin/status/${id}`, {
      method: 'PATCH',
      body: { status },
    });
  },

  // Added delete method to prevent errors in UI
  deleteVehicle: async (id) => {
    return await apiRequest(`/vehicles/delete/${id}`, {
      method: 'DELETE',
    });
  }
};