import { api } from "./vehicleApi";

export const getVehicleAvailability = async (vehicleId) => {
  const res = await api.get(`/bookings/availability/${vehicleId}`);
  return res.data; // { success, data: bookings[] }
};
