const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const apiVersion = process.env.EXPO_PUBLIC_API_VERSION;

export async function getVehicleAvailability(vehicleId) {
  if (!vehicleId) {
    throw new Error("Vehicle ID is required");
  }

  const url = `${baseUrl}${apiVersion}/bookings/availability/${vehicleId}`;

  const response = await fetch(url);

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || `Availability request failed: ${response.status}`,
    );
  }

  return data;
}
