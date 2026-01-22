import express from "express";
import {requiredSignIn} from "../middlewares/authMiddleware.js";
import {
  createReview,
  getReviewsByVehicle,
  updateReview,
  deleteReview,
  getMyReviews,
  canReviewVehicle,
  getReviewableBookings,
  getMyVehicleReviews,
  getVehicleRating
} from "../controllers/reviewController.js";

const router = express.Router();

// Public routes - no authentication required
router.get("/vehicle/:vehicle_id", getReviewsByVehicle);

// Protected routes - require authentication
router.post("/create", requiredSignIn, createReview);
router.get("/me", requiredSignIn, getMyReviews);
router.get("/can-review/:vehicle_id", requiredSignIn, canReviewVehicle);
router.get("/reviewable-bookings", requiredSignIn, getReviewableBookings);
router.get("/my-vehicles", requiredSignIn, getMyVehicleReviews);
router.put("update/:reviewId", requiredSignIn, updateReview);
router.delete("/delete/:reviewId", requiredSignIn, deleteReview);
router.get("/vehicle/:vehicle_id/rating", getVehicleRating);

export default router;