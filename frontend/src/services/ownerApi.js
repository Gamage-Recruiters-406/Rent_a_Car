import { api } from "./vehicleApi";

// Get owner bookings
export const getOwnerBookings = async (status) => {
  try {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    
    const url = `/bookings/owner${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await api.get(url);
    return res.data;
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    throw error;
  }
};

// Get owner earnings
export const getOwnerEarnings = async (ownerId, startDate, endDate) => {
  try {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    
    const url = `/bookings/owner/earnings/${ownerId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await api.get(url);
    return res.data;
  } catch (error) {
    console.error('Error fetching owner earnings:', error);
    throw error;
  }
};

// Get owner vehicles
export const getMyVehicleListings = async () => {
  try {
    const res = await api.get('/vehicle/get-my-all');
    return res.data;
  } catch (error) {
    console.error('Error fetching owner vehicles:', error);
    throw error;
  }
};

// Get owner vehicle reviews
export const getMyVehicleReviews = async () => {
  try {
    const res = await api.get('/reviews/my-vehicles');
    return res.data;
  } catch (error) {
    console.error('Error fetching owner vehicle reviews:', error);
    throw error;
  }
};
