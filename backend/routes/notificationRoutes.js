import express from "express";
import {
  getUserNotifications,
  markAsRead
} from "../controllers/notificationController.js";

import { requiredSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/notifications/:userId
 * @desc    Get all notifications for a user (customer or owner)
 * @access  Protected - only the logged-in user can access
 */
router.get("/me", requiredSignIn, getUserNotifications);

/**
 * @route   PUT /api/notifications/read/:notificationId
 * @desc    Mark a notification as read
 * @access  Protected - only the logged-in user can update
 */
router.put("/read/:notificationId", requiredSignIn, markAsRead);

export default router;
