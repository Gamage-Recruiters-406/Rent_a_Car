// src/services/bookingApi.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL 
const API_VERSION = import.meta.env.VITE_API_VERSION || "/api/v1";

const api = axios.create({
  baseURL: `${BASE_URL}${API_VERSION}`,
  withCredentials: true,
});

export const searchVehicles = async (params) => {
  try {
    const response = await api.get("/bookings/vehicleSearch", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createBooking = async (formData) => {
  try {
    const response = await api.post("/bookings/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getVehicleAvailability = async (vehicleId) => {
  const res = await api.get(`/bookings/availability/${vehicleId}`);
  return res.data; // { success, data: bookings[] }
};

export const getAllBookings = async () => {
  const res = await api.get('/bookings/get');
  return res.data; // { success, data: bookings[] }
};
