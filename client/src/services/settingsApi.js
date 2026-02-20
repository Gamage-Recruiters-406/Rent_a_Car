import { ENV } from "../../config/env";

// ------------------
// Get User Details
// ------------------
export async function getUserDetails() {
  const url = `${ENV.API_BASE_URL}${ENV.API_VERSION}/authUser/getUserDetails`;

  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;

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

// ------------------
// Update Email Notify
// ------------------
export async function updateEmailNotify(enabled) {
  const value = enabled ? "on" : "off";

  const url = `${ENV.API_BASE_URL}${ENV.API_VERSION}/authUser/emailNotify`;

  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ emailNotify: value }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `Request failed: ${res.status}`);
  }

  return data;
}
