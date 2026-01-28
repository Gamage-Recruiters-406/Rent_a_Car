import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";
import User from "../models/userModel.js";
import { sendBookingEmail, sendVehicleEmail,sendNewBookingRequestEmail,sendAdminVehicleNotificationEmail } from "../helpers/mailer.js";

// Check if user allows email notifications
const canSendEmail = async (userId) => {
  const user = await User.findById(userId).select("emailNotify email first_name");
  if (!user) return { allowed: false };

  return {
    allowed: user.emailNotify === "on",
    user
  };
};

  //Create notification and send email for booking approval/rejection
export const notifyBooking = async ({ type, bookingId }) => {
  const booking = await Booking.findById(bookingId)
    .populate("customerId","first_name email")
    .populate("ownerId","first_name email")
    .populate("vehicleId","title model year numberPlate");

  if (!booking) throw new Error("Booking not found");

  const description =
    type === "approved"
      ? `Your booking for "${booking.vehicleId.title}" (${booking.vehicleId.numberPlate}) from ${booking.startingDate.toDateString()} to ${booking.endDate.toDateString()} has been approved.`
      : `Your booking for "${booking.vehicleId.title}" (${booking.vehicleId.numberPlate}) from ${booking.startingDate.toDateString()} to ${booking.endDate.toDateString()} has been rejected.`;

  // Create notification
  await Notification.create({
    title: type === "approved" ? "Booking Approved" : "Booking Rejected",
    description,
    type: type === "approved" ? "confirmation" : "warning",
    userId: booking.customerId._id,
  });

  const { allowed } = await canSendEmail(booking.customerId._id);

  // Send email
  if (allowed) {
  await sendBookingEmail({
    type,
    booking,
    customer: booking.customerId,
    owner: booking.ownerId,
    vehicle: booking.vehicleId
  });
}
};

 //Create notification and send email for vehicle approval/rejection
export const notifyVehicle = async ({ type, vehicleId }) => {
  const vehicle = await Vehicle.findById(vehicleId).populate("ownerId","first_name email");
  if (!vehicle) throw new Error("Vehicle not found");

  vehicle.status = type === "approved" ? "Approved" : "Rejected";
  await vehicle.save();

  const description =
    type === "approved"
      ? `Your vehicle "${vehicle.title}" (${vehicle.numberPlate}) has been approved and is now visible to customers.`
      : `Your vehicle "${vehicle.title}" (${vehicle.numberPlate}) has been rejected. Please check the details and submit again.`;


  // Create notification
  await Notification.create({
    title: type === "approved" ? "Vehicle Approved" : "Vehicle Rejected",
    description,
    type: type === "approved" ? "confirmation" : "warning",
    userId: vehicle.ownerId._id
  });

  const { allowed } = await canSendEmail(vehicle.ownerId._id);

  // Send email
  if(allowed){
    await sendVehicleEmail({
    type,
    vehicle,
    owner: vehicle.ownerId
  });
  }
};

  //Get notifications for the logged-in user
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id; // get logged-in user ID

    const notifications = await Notification.find({
     userId: userId
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
      !notification.userId?.equals(userId) 
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

// get unread count (total)
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await Notification.countDocuments({
      isRead: false,
      userId: userId
    });

    res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

//get unread count by type
export const getUnreadCountsByType = async (req, res) => {
  try {
    const userId = req.user._id;

    const counts = await Notification.aggregate([
      {
        $match: {
          isRead: false,
          userId: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      alert: 0,
      info: 0,
      warning: 0,
      confirmation: 0
    };

    counts.forEach(c => {
      result[c._id] = c.count;
    });

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//get new booking request by owner(send to owner when new booking create)
export const notifyNewBookingRequest = async (bookingId) => {
  const booking = await Booking.findById(bookingId)
    .populate("customerId", "first_name")
    .populate("ownerId", "first_name _id")
    .populate("vehicleId", "title numberPlate");

  if (!booking) throw new Error("Booking not found");

  await Notification.create({
    title: "New Booking Request",
    description: `${booking.customerId.first_name} requested to book your vehicle ${booking.vehicleId.title} (${booking.vehicleId.numberPlate})`,
    type: "alert",
    userId: booking.ownerId._id,
    isRead: false
  });

  const { allowed } = await canSendEmail(booking.ownerId._id);

  // Send email
  if(allowed){
    await sendNewBookingRequestEmail({
    booking,
    customer: booking.customerId,
    owner: booking.ownerId,
    vehicle: booking.vehicleId
  });
  }
};

//get new vehicle approve request by admin
export const notifyAdminNewVehicle = async (vehicleId) => {
  const vehicle = await Vehicle.findById(vehicleId).populate("ownerId", "first_name");
  if (!vehicle) throw new Error("Vehicle not found");

  // Find all admins
  const admins = await User.find({ role: 3 }); // assuming role 3 = admin

  const notifications = admins.map(admin => ({
    title: "Vehicle Approval Request",
    description: `${vehicle.ownerId.first_name} submitted a new vehicle "${vehicle.title}" (${vehicle.numberPlate}) for approval.`,
    type: "info",
    userId: admin._id,
    role: 3,
    isRead: false,
  }));

  await Notification.insertMany(notifications);

  // Optional: send email to all admins
  await Promise.all(
  admins.map(admin =>
    sendAdminVehicleNotificationEmail({
      vehicle,
      owner: vehicle.ownerId,
      adminEmail: admin.email,
      type: "new"  
    })
  )
);
};

//get unread notifications
export const getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({
      isRead: false,
      userId: userId 
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get notifications by type (and optional unread)
export const getNotificationsByType = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, unread } = req.query;

    const query = {
      userId: userId
    };

    if (type) query.type = type;
    if (unread === "true") query.isRead = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

//get notification when customer update booking request
export const notifyBookingUpdated = async (bookingId) => {
  const booking = await Booking.findById(bookingId)
    .populate("customerId", "first_name")
    .populate("ownerId", "first_name email _id")
    .populate("vehicleId", "title numberPlate");

  if (!booking) throw new Error("Booking not found");

  // Notification
  await Notification.create({
    title: "Booking Updated",
    description: `${booking.customerId.first_name} updated the booking for ${booking.vehicleId.title} (${booking.vehicleId.numberPlate}).`,
    type: "info",
    userId: booking.ownerId._id,
    isRead: false
  });

  // Email (if owner allows)
  const { allowed } = await canSendEmail(booking.ownerId._id);
  if (allowed) {
    await sendBookingEmail({
      type: "updated",
      booking,
      customer: booking.customerId,
      owner: booking.ownerId,
      vehicle: booking.vehicleId
    });
  }
};

//get notification when customer delete booking request
export const notifyBookingCancelled = async (bookingId) => {
  const booking = await Booking.findById(bookingId)
    .populate("customerId", "first_name")
    .populate("ownerId", "first_name email _id")
    .populate("vehicleId", "title numberPlate");

  if (!booking) throw new Error("Booking not found");

  // Notification
  await Notification.create({
    title: "Booking Cancelled",
    description: `${booking.customerId.first_name} cancelled the booking for ${booking.vehicleId.title} (${booking.vehicleId.numberPlate}).`,
    type: "warning",
    userId: booking.ownerId._id,
    isRead: false
  });

  // Email (if owner allows)
  const { allowed } = await canSendEmail(booking.ownerId._id);
  if (allowed) {
    await sendBookingEmail({
      type: "cancelled",
      booking,
      customer: booking.customerId,
      owner: booking.ownerId,
      vehicle: booking.vehicleId
    });
  }
};

// Notify admins when a vehicle is updated by the owner
export const notifyAdminVehicleUpdated = async (vehicleId) => {
  const vehicle = await Vehicle.findById(vehicleId).populate("ownerId", "first_name email");
  if (!vehicle) throw new Error("Vehicle not found");

  // Get all admins
  const admins = await User.find({ role: 3 }); // assuming role 3 = admin

  // Create notifications for each admin
  const notifications = admins.map(admin => ({
    title: "Vehicle Updated",
    description: `${vehicle.ownerId.first_name} updated their vehicle "${vehicle.title}" (${vehicle.numberPlate}).`,
    type: "info",
    userId: admin._id,
    isRead: false,
  }));

  await Notification.insertMany(notifications);

  // Send emails to admins
  await Promise.all(
    admins.map(admin =>
      sendAdminVehicleNotificationEmail({
        vehicle,
        owner: vehicle.ownerId,
        adminEmail: admin.email,
        type: "updated"
      })
    )
  );
};

// Notify admins when a vehicle is deleted by the owner
export const notifyAdminVehicleDeleted = async (vehicleId) => {
  // Get vehicle with populated owner BEFORE deletion
  const vehicle = await Vehicle.findById(vehicleId)
    .populate("ownerId", "first_name last_name email");
    
  if (!vehicle) throw new Error("Vehicle not found");

  // Get all admins
  const admins = await User.find({ role: 3 });

  // Create notifications
  const notifications = admins.map(admin => ({
    title: "Vehicle Deleted",
    description: `${vehicle.ownerId.first_name} deleted their vehicle "${vehicle.title}" (${vehicle.numberPlate}).`,
    type: "warning",
    userId: admin._id,
    isRead: false,
  }));

  await Notification.insertMany(notifications);

  // Send emails
  await Promise.all(
    admins.map(admin =>
      sendAdminVehicleNotificationEmail({
        vehicle,
        owner: vehicle.ownerId,  
        adminEmail: admin.email,
        type: "deleted"
      })
    )
  );
};














