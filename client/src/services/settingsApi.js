import AsyncStorage from "@react-native-async-storage/async-storage";

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const apiVersion = process.env.EXPO_PUBLIC_API_VERSION;

// ------------------
// Get User Details
// ------------------
export async function getUserDetails() {
  const token = await AsyncStorage.getItem("userToken");

  const res = await fetch(`${baseUrl}${apiVersion}/authUser/getUserDetails`, {
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

// ------------------
// Update Email Notify
// ------------------
export async function updateEmailNotify(enabled) {
  const token = await AsyncStorage.getItem("userToken");

  const res = await fetch(`${baseUrl}${apiVersion}/authUser/emailNotify`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      emailNotify: enabled ? "on" : "off",
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `Request failed: ${res.status}`);
  }

  return data;
}
