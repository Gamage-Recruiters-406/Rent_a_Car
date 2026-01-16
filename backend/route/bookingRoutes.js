import express from "express";
import {
    createBooking,
    getBookings,
    getBookingById,
    updateBooking,
    deleteBooking,
    approveBooking,
    rejectBooking,
} from "../controller/bookingController.js";

const router = express.Router();

router.post("/", createBooking);
router.get("/", getBookings);
router.get("/:id", getBookingById);
router.put("/:id", updateBooking);
router.patch("/:id/approve", approveBooking);
router.patch("/:id/reject", rejectBooking);
router.delete("/:id", deleteBooking);

export default router;
