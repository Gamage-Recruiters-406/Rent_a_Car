import express from 'express';
import { requiredSignIn, isOwner } from '../middlewares/authMiddleware.js';
import { uploadVehiclePhotos } from '../middlewares/uploadMiddleware.js';
import { createVehicleListing, deleteVehicleListing } from '../controllers/vehicleController.js';

const router = express.Router();

// OWNER 
// Create vehicle listing
router.post("/create", requiredSignIn, isOwner, uploadVehiclePhotos.array("photos", 10), createVehicleListing);
// Delete vehicle listing
router.delete("/delete/:id", requiredSignIn, isOwner, deleteVehicleListing);

export default router;