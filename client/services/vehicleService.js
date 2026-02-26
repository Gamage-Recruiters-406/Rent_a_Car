import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config/apiConfig";

// ─── Helper: get auth token from secure storage ───────────────────────────────
const getAuthHeader = async () => {
  const token = await SecureStore.getItemAsync("authToken");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ─── GET /get-my-all ──────────────────────────────────────────────────────────
export const getMyVehicleListings = async () => {
  const config = await getAuthHeader();
  const response = await axios.get(
    `${API_BASE_URL}/vehicle/get-my-all`,
    config
  );
  return response.data;
};

// ─── GET /get/:id ─────────────────────────────────────────────────────────────
export const getSingleVehicleListing = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/vehicle/get/${id}`);
  return response.data;
};

// ─── POST /create ─────────────────────────────────────────────────────────────
export const createVehicleListing = async (formData) => {
  const token = await SecureStore.getItemAsync("authToken");
  const response = await axios.post(
    `${API_BASE_URL}/vehicle/create`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// ─── PUT /update/:id ──────────────────────────────────────────────────────────
export const updateVehicleListing = async (id, formData) => {
  const token = await SecureStore.getItemAsync("authToken");
  const response = await axios.put(
    `${API_BASE_URL}/vehicle/update/${id}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// ─── DELETE /delete/:id ───────────────────────────────────────────────────────
export const deleteVehicleListing = async (id) => {
  const config = await getAuthHeader();
  const response = await axios.delete(
    `${API_BASE_URL}/vehicle/delete/${id}`,
    config
  );
  return response.data;
};