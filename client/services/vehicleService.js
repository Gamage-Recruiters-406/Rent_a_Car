import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION;

/** Use this to build full photo URLs: getImageBaseUrl() + photo.url */
export const getImageBaseUrl = () => BASE_URL;

// ─── Axios instance ───────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: `${BASE_URL}${API_VERSION}`,
  withCredentials: true,
});

// ─── GET /vehicle/get-all (PUBLIC - no auth required) ─────────────────────────
// Controller returns: { success, count, vehicles: [...] }
// Only returns Approved vehicles with verified owners
export const getMyVehicleListings = async () => {
  const res = await api.get("/vehicle/get-all");
  return res.data;
};

// ─── GET /vehicle/get/:id (PUBLIC - no auth required) ─────────────────────────
// Controller returns: { success, vehicle }
export const getSingleVehicleListing = async (id) => {
  const res = await api.get(`/vehicle/get/${id}`);
  return res.data;
};

// ─── POST /vehicle/create (requires auth - add later) ────────────────────────
export const createVehicleListing = async (formData) => {
  const res = await api.post("/vehicle/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ─── PUT /vehicle/update/:id (requires auth - add later) ─────────────────────
export const updateVehicleListing = async (id, formData) => {
  const res = await api.put(`/vehicle/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ─── DELETE /vehicle/delete/:id (requires auth - add later) ──────────────────
export const deleteVehicleListing = async (id) => {
  const res = await api.delete(`/vehicle/delete/${id}`);
  return res.data;
};

// ─── GET /vehicle/vehicle-count (PUBLIC) ─────────────────────────────────────
export const getApprovedVehicleCount = async () => {
  const res = await api.get("/vehicle/vehicle-count");
  return res.data;
};