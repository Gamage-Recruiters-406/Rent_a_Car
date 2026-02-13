import { ENV } from "../../config/env";

export async function getVehicleById(id) {
  const url = `${ENV.API_BASE_URL}${ENV.API_VERSION}/vehicle/get/${id}`;

  const res = await fetch(url);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `Request failed: ${res.status}`);
  }

  return data;
}
