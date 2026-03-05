import AsyncStorage from "@react-native-async-storage/async-storage";

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const apiVersion = process.env.EXPO_PUBLIC_API_VERSION;

export async function getVehicleById(id) {
  const token = await AsyncStorage.getItem("userToken");

  const url = `${baseUrl}${apiVersion}/vehicle/get/${id}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `Request failed: ${res.status}`);
  }

  return data;
}
