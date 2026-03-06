import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION;

/** Use this to build full photo URLs: getImageBaseUrl() + photo.url */
export const getImageBaseUrl = () => BASE_URL;

// ─── Axios instance ───────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: `${BASE_URL}${API_VERSION}`,
  withCredentials: true,
});

// ─── Request interceptor: auto-attach token ───────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const possibleKeys = ["token", "authToken", "auth_token", "accessToken", "jwt"];
    let token = null;

    for (const key of possibleKeys) {
      const val = await AsyncStorage.getItem(key);
      if (val) {
        token = val;
        break;
      }
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
  async (error) => {
    if (error.response?.status === 401) {
      const keys = ["token", "authToken", "auth_token", "accessToken", "jwt", "user"];
      await Promise.all(keys.map((key) => AsyncStorage.removeItem(key)));
    }
    return Promise.reject(error);
  }
);

// ─── GET /vehicle/get-all (PUBLIC) ────────────────────────────────────────────
export const getMyVehicleListings = async () => {
  const res = await api.get("/vehicle/get-all");
  return res.data;
};

// ─── GET /vehicle/get/:id (PUBLIC) ───────────────────────────────────────────
export const getSingleVehicleListing = async (id) => {
  const res = await api.get(`/vehicle/get/${id}`);
  return res.data;
};

// ─── POST /vehicle/create (requiredSignIn + isVerifiedUser + isOwner) ─────────
export const createVehicleListing = async (formData) => {
  const res = await api.post("/vehicle/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ─── PUT /vehicle/update/:id (requiredSignIn + isOwner) ──────────────────────
export const updateVehicleListing = async (id, formData) => {
  const res = await api.put(`/vehicle/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ─── DELETE /vehicle/delete/:id (requiredSignIn + isOwner) ───────────────────
export const deleteVehicleListing = async (id) => {
  const res = await api.delete(`/vehicle/delete/${id}`);
  return res.data;
};

// ─── GET /vehicle/vehicle-count (PUBLIC) ─────────────────────────────────────
export const getApprovedVehicleCount = async () => {
  const res = await api.get("/vehicle/vehicle-count");
  return res.data;
};