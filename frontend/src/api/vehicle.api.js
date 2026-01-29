import axiosInstance from './axios';

export const vehicleAPI = {
  getAllVehicles: async () => {
    const response = await axiosInstance.get('/vehicle');
    return response.data;
  },

  getVehicleById: async (id) => {
    const response = await axiosInstance.get(`/vehicle/${id}`);
    return response.data;
  },

  createVehicle: async (vehicleData) => {
    const response = await axiosInstance.post('/vehicle/create', vehicleData);
    return response.data;
  },

  deleteVehicle: async (id) => {
    const response = await axiosInstance.delete(`/vehicle/delete/${id}`);
    return response.data;
  },

  updateVehicleStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/vehicle/status/${id}`, { status });
    return response.data;
  },
};