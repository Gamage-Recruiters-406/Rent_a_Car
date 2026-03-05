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

// ─── Request interceptor: auto-attach token for auth-required routes ──────────
// Checks all common token key names used across the app
api.interceptors.request.use(
  (config) => {
    const possibleKeys = ["token", "authToken", "auth_token", "accessToken", "jwt"];
    let token = null;
    for (const key of possibleKeys) {
      const val = localStorage.getItem(key);
      if (val) { token = val; break; }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      ["token", "authToken", "auth_token", "accessToken", "jwt", "user"].forEach(
        (key) => localStorage.removeItem(key)
      );
    }
    return Promise.reject(error);
  }
);

// ─── GET /vehicle/get-all (PUBLIC) ────────────────────────────────────────────
// No auth required — returns Approved vehicles with verified owners
// Controller returns: { success, count, vehicles: [...] }
export const getMyVehicleListings = async () => {
  const res = await api.get("/vehicle/get-all");
  return res.data;
};

// ─── GET /vehicle/get/:id (PUBLIC) ───────────────────────────────────────────
// No auth required
// Controller returns: { success, vehicle }
export const getSingleVehicleListing = async (id) => {
  const res = await api.get(`/vehicle/get/${id}`);
  return res.data;
};

// ─── POST /vehicle/create (requiredSignIn + isVerifiedUser + isOwner) ─────────
// multipart/form-data for photos
export const createVehicleListing = async (formData) => {
  const res = await api.post("/vehicle/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ─── PUT /vehicle/update/:id (requiredSignIn + isOwner) ──────────────────────
// multipart/form-data for photos
export const updateVehicleListing = async (id, formData) => {
  const res = await api.put(`/vehicle/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ─── DELETE /vehicle/delete/:id (requiredSignIn + isOwner) ───────────────────
// Token is auto-attached via request interceptor above
// Controller returns: { success, message, deletedId }
export const deleteVehicleListing = async (id) => {
  const res = await api.delete(`/vehicle/delete/${id}`);
  return res.data;
};

// ─── GET /vehicle/vehicle-count (PUBLIC) ─────────────────────────────────────
export const getApprovedVehicleCount = async () => {
  const res = await api.get("/vehicle/vehicle-count");
  return res.data;
};