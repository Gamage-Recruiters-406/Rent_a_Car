// This file replaces import.meta.env for React Native
export const API_CONFIG = {
  // Use 10.0.2.2 for Android Emulator to access localhost, otherwise use your machine's IP
  // If running on physical device, replace 'localhost' with your machine's local IP address
  BASE_URL: 'http://192.168.1.5:5000', // Example IP, adjust as needed. Or use localhost if on emulator properly mapped.
  VERSION: '/api/v1',
};

// Helper to construct full URL
export const getApiUrl = (endpoint) => `${API_CONFIG.BASE_URL}${API_CONFIG.VERSION}${endpoint}`;
