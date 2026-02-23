// src/services/vehicleService.js

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8090";
const API_VERSION = import.meta.env.VITE_API_VERSION || "/api/v1";

/** Base URL for vehicle photo URLs */
export const getImageBaseUrl = () => BASE_URL;

export const api = axios.create({
  baseURL: `${BASE_URL}${API_VERSION}`,
  withCredentials: true,
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

// Constants
export const VEHICLE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

/**
 * GET user by ID (Admin only)
 * Backend: GET /api/v1/user/getUserbyId/:id
 */
export const getUserById = async (id) => {
  if (!id) return null;
  try {
    const res = await api.get(`/user/getUserbyId/${id}`);
    console.log(`[getUserById] Response for ${id}:`, res.data);
    return res.data;
  } catch (err) {
    console.error(`[getUserById] Failed for id=${id}:`, err.response?.status, err.response?.data);
    throw err;
  }
};

/**
 * Extract display name from a user object.
 * Logs the raw user so you can see exactly what fields exist.
 */
export const resolveUserName = (user) => {
  console.log('[resolveUserName] raw user object:', user);
  if (!user) return 'Unknown Owner';
  if (typeof user === 'string') return user;

  // Try every common field combination
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`.trim();
  if (user.firstName)                  return user.firstName;
  if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`.trim();
  if (user.first_name)                 return user.first_name;
  if (user.name)                       return user.name;
  if (user.fullName)                   return user.fullName;
  if (user.username)                   return user.username;
  if (user.email)                      return user.email;

  return 'Unknown Owner';
};

/**
 * GET single vehicle details
 * Backend: GET /api/v1/vehicle/get/:id
 */
export const getVehicleById = async (id) => {
  const res = await api.get(`/vehicle/get/${id}`);
  return res.data;
};

/**
 * GET all vehicles (ADMIN)
 * Backend: GET /api/v1/vehicle/admin/get-all
 */
export const getAllVehicles = async () => {
  const res = await api.get("/vehicle/admin/get-all");
  return res.data;
};

/**
 * UPDATE vehicle status (Approve/Reject) - ADMIN
 * Backend: PATCH /api/v1/vehicle/admin/status/:id
 */
export const updateVehicleStatus = async (id, status, rejectionReason = null) => {
  let apiStatus = status;
  if (typeof status === "string") {
    const lower = status.toLowerCase();
    if (lower === VEHICLE_STATUS.PENDING)       apiStatus = "Pending";
    else if (lower === VEHICLE_STATUS.APPROVED) apiStatus = "Approved";
    else if (lower === VEHICLE_STATUS.REJECTED) apiStatus = "Rejected";
  }

  const payload = { status: apiStatus };
  if (rejectionReason && apiStatus === "Rejected") {
    payload.rejectionReason = rejectionReason;
  }

  const res = await api.patch(`/vehicle/admin/status/${id}`, payload);
  return res.data;
};

/**
 * DELETE vehicle listing
 * Backend: DELETE /api/v1/vehicle/delete/:id
 */
export const deleteVehicle = async (id) => {
  const res = await api.delete(`/vehicle/delete/${id}`);
  return res.data;
};

export const vehicleAPI = {
  getAllVehicles,
  getVehicleById,
  updateVehicleStatus,
  deleteVehicle,
  getUserById,
};