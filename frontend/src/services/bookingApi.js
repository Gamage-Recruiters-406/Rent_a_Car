// src/services/bookingApi.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8090";
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
  try {
    const response = await api.get(`/bookings/availability/${vehicleId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
