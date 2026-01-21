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
import {
    requiredSignIn,
    isAdmin,
    isCustomer,
    isOwner,
} from "../middlewares/authMiddleware.js";
import { uploadBookingDocuments } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/vehicleSearch", searchVehicles);
router.get("/availability/:vehicleId", getVehicleAvailability);
router.get("/customer/:customerId", requiredSignIn, isCustomer, getCustomerBookings);
router.get("/owner/earnings/:ownerId", requiredSignIn, isOwner, getOwnerEarnings);
router.get("/owner/:ownerId", requiredSignIn, isOwner, getOwnerBookings);
router.post("/create", requiredSignIn, isCustomer, uploadBookingDocuments.array("documents", 5), createBooking);
router.get("/get", requiredSignIn, isAdmin, getBookings);
router.get("/get/:id", requiredSignIn, getBookingById);
router.put("/update/:id", requiredSignIn, updateBooking);
router.patch("/approve/:id", requiredSignIn, isOwner, approveBooking);
router.patch("/reject/:id", requiredSignIn, isOwner, rejectBooking);
router.delete("/delete/:id", requiredSignIn, deleteBooking);

export default router;
