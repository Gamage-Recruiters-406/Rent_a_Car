import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8090";
const API_VERSION = import.meta.env.VITE_API_VERSION || "/api/v1";

export const api = axios.create({
  baseURL: `${BASE_URL}${API_VERSION}`,
  withCredentials: true, // This sends cookies with requests
});

// Get all bookings (Admin only)
export const getAllBookings = async () => {
  const res = await api.get("/bookings/get");
  return res.data; // { success, message, data }
};
