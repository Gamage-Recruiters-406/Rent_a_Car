import Notification from "../models/Notification.js";
import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";
import { sendBookingEmail, sendVehicleEmail } from "../helpers/mailer.js";

  //Create notification and send email for booking approval/rejection

export const notifyBooking = async ({ type, bookingId }) => {
  const booking = await Booking.findById(bookingId)
    .populate("customerId")
    .populate("ownerId")
    .populate("vehicleId");

  if (!booking) throw new Error("Booking not found");

  booking.status = type;
  await booking.save();

  // Create notification
  await Notification.create({
    title: type === "approved" ? "Booking Approved" : "Booking Rejected",
    description: `Your booking ${booking._id} has been ${type}.`,
    customer_id: booking.customerId._id,
    owner_id: booking.ownerId._id,
    booking_id: booking._id
  });

  // Send email
  await sendBookingEmail({
    type,
    booking,
    customer: booking.customerId,
    owner: booking.ownerId,
    vehicle: booking.vehicleId
  });
};

 //Create notification and send email for vehicle approval/rejection
 
export const notifyVehicle = async ({ type, vehicleId }) => {
  const vehicle = await Vehicle.findById(vehicleId).populate("ownerId");
  if (!vehicle) throw new Error("Vehicle not found");

  vehicle.status = type;
  await vehicle.save();

  // Create notification
  await Notification.create({
    title: type === "approved" ? "Vehicle Approved" : "Vehicle Rejected",
    description: `Your vehicle ${vehicle.title} has been ${type}.`,
    owner_id: vehicle.ownerId._id
  });

  // Send email
  await sendVehicleEmail({
    type,
    vehicle,
    owner: vehicle.ownerId
  });
};

  //Get notifications for the logged-in user

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id; // get logged-in user ID

    const notifications = await Notification.find({
      $or: [{ customer_id: userId }, { owner_id: userId }]
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

  //Mark a notification as read

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id; // logged-in user

    // Find the notification
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    // Ensure the logged-in user owns the notification
    if (
      !notification.customer_id?.equals(userId) &&
      !notification.owner_id?.equals(userId)
    ) {
    return res.status(403).json({ success: false, message: "Access denied" });
}


    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
