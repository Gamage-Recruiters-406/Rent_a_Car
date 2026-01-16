import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    review: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 500
    },

    // Optional: Add status if reviews need moderation
    status: {
      type: String,
      enum: ['active', 'pending', 'rejected'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate reviews from same user for same vehicle
reviewSchema.index({ vehicleId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);