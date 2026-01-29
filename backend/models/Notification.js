import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true   // createdAt = notification date
  }
);

export default mongoose.model("Notification", notificationSchema);
