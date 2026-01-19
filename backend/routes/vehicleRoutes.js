import express from 'express';
import { requiredSignIn, isOwner } from '../middlewares/authMiddleware.js';
import { uploadVehiclePhotos } from '../middlewares/uploadMiddleware.js';
import { createVehicleListing } from '../controllers/vehicleController.js';

const router = express.Router();

// Owner-only create vehicle listing + multiple photo upload
router.post("/create", requiredSignIn, isOwner, uploadVehiclePhotos.array("photos", 10), createVehicleListing);

export default router;