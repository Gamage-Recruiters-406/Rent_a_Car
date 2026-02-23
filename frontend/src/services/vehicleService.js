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
 * NOTE: Backend only populates ownerId with { name, email, phoneNumber }
 * It does NOT include first_name / last_name in this endpoint.
 */
export const getAllVehicles = async () => {
  const res = await api.get("/vehicle/admin/get-all");
  return res.data;
};

/**
 * GET all available vehicles (public/customer endpoint — no auth needed)
 * Backend: GET /api/v1/vehicle/get-all
 * This endpoint populates ownerId with { first_name, last_name, email, ... }
 * We use this to build an ownerId → full name lookup map.
 */
export const getAllAvailableVehiclesPublic = async () => {
  const res = await api.get("/vehicle/get-all");
  return res.data;
};

/**
 * Build a map of { ownerId_string → "First Last" } from the public endpoint.
 * Falls back to empty map if the request fails.
 */
export const buildOwnerNameMap = async () => {
  try {
    const data = await getAllAvailableVehiclesPublic();
    const vehicles = data?.vehicles || [];
    const map = {};
    vehicles.forEach((v) => {
      const owner = v.ownerId;
      if (!owner || typeof owner !== "object") return;
      const ownerId = owner._id?.toString();
      if (!ownerId) return;

      // This endpoint selects: first_name, last_name, email, contactNumber, status
      let name = "";
      if (owner.first_name && owner.last_name) {
        name = `${owner.first_name} ${owner.last_name}`.trim();
      } else if (owner.first_name) {
        name = owner.first_name.trim();
      } else if (owner.last_name) {
        name = owner.last_name.trim();
      } else if (owner.name) {
        name = owner.name.trim();
      }

      if (name) map[ownerId] = name;
    });
    return map;
  } catch (err) {
    console.warn("[buildOwnerNameMap] Failed to fetch public vehicles:", err);
    return {};
  }
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
  buildOwnerNameMap,
};