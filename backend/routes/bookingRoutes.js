import express from "express";
import {
    createBooking,
    getBookings,
    getBookingById,
    updateBooking,
    deleteBooking,
    approveBooking,
    rejectBooking,
    searchVehicles,
    getVehicleAvailability,
    getCustomerBookings,
    getOwnerBookings,
    getOwnerEarnings,
} from "../controllers/bookingController.js";

const router = express.Router();

router.get("/search", searchVehicles);
router.get("/availability/:vehicleId", getVehicleAvailability);
router.get("/customer/:customerId", getCustomerBookings);
router.get("/owner/:ownerId/earnings", getOwnerEarnings);
router.get("/owner/:ownerId", getOwnerBookings);
router.post("/", createBooking);
router.get("/", getBookings);
router.get("/:id", getBookingById);
router.put("/:id", updateBooking);
router.patch("/:id/approve", approveBooking);
router.patch("/:id/reject", rejectBooking);
router.delete("/:id", deleteBooking);

export default router;
