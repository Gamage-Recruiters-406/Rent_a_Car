import api from "./api";

// Get owner's rental bookings
export const getOwnerBookings = async () => {
  const response = await api.get(`/bookings/owner`);
  return response.data.data;
};

export default { getOwnerBookings };
