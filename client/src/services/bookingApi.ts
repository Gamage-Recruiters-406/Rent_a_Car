import { ENV } from "../../config/env";

export async function getVehicleAvailability(vehicleId: string) {
  const url = `${ENV.API_BASE_URL}${ENV.API_VERSION}/bookings/availability/${vehicleId}`;

  const res = await fetch(url);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      data?.message || `Availability request failed: ${res.status}`,
    );
  }

  return data;
}
