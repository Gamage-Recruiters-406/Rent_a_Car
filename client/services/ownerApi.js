import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION;

// ─── Helpers ────────────────────────────────────────────────────────────────

const getToken = async () => AsyncStorage.getItem("userToken");
const getUserId = async () => AsyncStorage.getItem("userId");
const getUserRole = async () => AsyncStorage.getItem("userRole");

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Maps backend booking.status + dates → UI status label
 *  pending   → "Pending"
 *  approved  → "Ongoing"  (endDate in the future)
 *  approved  → "Completed" (endDate in the past)
 *  rejected  → "Canceled"
 *  cancelled → "Canceled"
 */
const mapStatus = (booking) => {
  const now = new Date();
  const endDate = new Date(booking.endDate);

  switch (booking.status) {
    case "approved":
      return endDate < now ? "Completed" : "Ongoing";
    case "rejected":
    case "cancelled":
      return "Canceled";
    case "pending":
      return "Pending";
    default:
      return booking.status;
  }
};

/**
 * Converts a raw Booking document (with populated vehicleId / customerId)
 * into the shape expected by rental-history and rental-details UIs.
 */
const normalizeBooking = (booking) => {
  const vehicle = booking.vehicleId || {};
  const customer = booking.customerId || {};

  // Build photo URL: vehicle photos have relative paths like /uploads/…
  const rawPhotoUrl = vehicle.photos?.[0]?.url;
  const photoUrl = rawPhotoUrl
    ? `${BASE_URL}${rawPhotoUrl}`
    : "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=250&fit=crop";

  const renterName = customer.first_name
    ? `${customer.first_name} ${customer.last_name}`
    : "Customer";

  return {
    id: booking._id,

    // Vehicle fields
    vehicleName: vehicle.title || "Vehicle",
    registrationNo: vehicle.numberPlate || "-",
    seats: vehicle.seats ? `${vehicle.seats} Seats` : "-",
    transmission: vehicle.transmission || "-",
    fuelType: vehicle.fuelType || "-",
    image: photoUrl,

    // In the owner view the secondary "ownerName" label shows the renter
    ownerName: renterName,

    // Renter (customer) fields
    renterName,
    renterPhone: customer.contactNumber ? `+${customer.contactNumber}` : "-",
    renterEmail: customer.email || "-",
    licenseNo: "-", // Not stored in the Booking model

    // Dates
    pickupDate: formatDate(booking.startingDate),
    pickupTime: formatTime(booking.startingDate),
    returnDate: formatDate(booking.endDate),
    returnTime: formatTime(booking.endDate),

    // Payment (backend has no insurance/serviceTax breakdown)
    baseRent: booking.totalAmount || 0,
    insurance: 0,
    serviceTax: 0,
    totalAmount: booking.totalAmount || 0,
    dailyRate: booking.dailyRate || 0,
    currency: booking.currency || "LKR",

    // Status
    status: mapStatus(booking),
    rawStatus: booking.status, // original backend value

    // Documents
    documents: booking.documents || [],
  };
};

// ─── API functions ───────────────────────────────────────────────────────────

/**
 * GET /api/v1/bookings/owner/:ownerId
 * Returns all bookings for the signed-in owner (optionally filtered by status).
 */
export const getOwnerBookings = async (status) => {
  const [token, role] = await Promise.all([getToken(), getUserRole()]);

  if (!token) throw new Error("Not authenticated. Please log in.");
  if (String(role) !== "2")
    throw new Error("Access denied. Owner account required.");

  const query = status ? `?status=${status}` : "";
  const url = `${BASE_URL}${API_VERSION}/bookings/owner${query}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to fetch bookings");

  return (data.data || []).map(normalizeBooking);
};

/**
 * GET /api/v1/bookings/get/:id
 * Returns a single booking by ID (owner or customer can access their own).
 */
export const getBookingById = async (bookingId) => {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");

  const url = `${BASE_URL}${API_VERSION}/bookings/get/${bookingId}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to fetch booking");

  return normalizeBooking(data.data);
};

/**
 * PATCH /api/v1/bookings/approve/:id
 * Approve a pending booking (owner only).
 */
export const approveBooking = async (bookingId) => {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");

  const url = `${BASE_URL}${API_VERSION}/bookings/approve/${bookingId}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to approve booking");

  return data;
};

/**
 * PATCH /api/v1/bookings/reject/:id
 * Reject a pending booking (owner only).
 */
export const rejectBooking = async (bookingId) => {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");

  const url = `${BASE_URL}${API_VERSION}/bookings/reject/${bookingId}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to reject booking");

  return data;
};
