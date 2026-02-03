import { api } from "./vehicleApi";

export const getVehicleAvailability = async (vehicleId) => {
  const res = await api.get(`/bookings/availability/${vehicleId}`);
  return res.data; // { success, data: bookings[] }
};

export const getAllBookings = async () => {
  const token = localStorage.getItem('token');
  
  console.log('Token exists:', !!token);
  console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'null');
  
  if (!token) {
    const error = new Error('No authentication token found. Please log in.');
    error.status = 401;
    throw error;
  }
  
  // Set token as cookie since backend expects it in req.cookies.access_token
  document.cookie = `access_token=${token}; path=/; SameSite=Lax`;
  
  try {
    console.log('Making request to /bookings/get with cookie');
    const res = await api.get('/bookings/get');
    console.log('Bookings fetched successfully:', res.data);
    return res.data; // { success, data: bookings[] }
  } catch (error) {
    console.error('Error in getAllBookings:', error.response?.status, error.response?.data);
    // If token is invalid or expired, clear it from localStorage and cookies
    if (error.response?.status === 401) {
      console.log('401 error - clearing token from localStorage and cookies');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    throw error;
  }
};


