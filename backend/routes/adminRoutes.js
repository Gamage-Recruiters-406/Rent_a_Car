import express from "express";
import { requiredSignIn, isAdmin } from "../middlewares/authMiddleware.js";
import { getMonthlyUserChart,
         getUserReportStats,
         getVehicleReportStats,
         getBookingReportStats,
         getVehicleAvailabilityReport} from "../controllers/adminReportController.js";

const router = express.Router();

//user improvement chart
router.get("/user-chart",requiredSignIn,isAdmin,getMonthlyUserChart);

//get user report details
router.get("/admin/user-report",requiredSignIn, isAdmin,getUserReportStats);

//get vehicle report details
router.get("/admin/vehicle-report",requiredSignIn, isAdmin,getVehicleReportStats);

//get booking report analysis
router.get("/admin/booking-report",requiredSignIn, isAdmin,getBookingReportStats);

//vehicle availability chart
router.get("/admin/vehicle-availability",requiredSignIn, isAdmin,getVehicleAvailabilityReport);

export default router;
