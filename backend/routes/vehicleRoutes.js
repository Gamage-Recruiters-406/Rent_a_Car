import express from 'express';
import { requiredSignIn, isOwner, isAdmin, isVerifiedUser } from '../middlewares/authMiddleware.js';
import { uploadVehiclePhotos } from '../middlewares/uploadMiddleware.js';
import { createVehicleListing, 
        deleteVehicleListing, 
        getSingleVehicleListing, 
        getMyVehicleListings,
        updateVehicleListing,
        updateVehicleStatus, 
        getAllVehicleListings,
        getAllAvailableVehicles} from '../controllers/vehicleController.js';

const router = express.Router();

// OWNER 
// Create vehicle listing
router.post("/create", requiredSignIn, isVerifiedUser, isOwner, uploadVehiclePhotos.array("photos", 10), createVehicleListing);
// Delete vehicle listing
router.delete("/delete/:id", requiredSignIn, isOwner, deleteVehicleListing);
// Get single vehicle listing
router.get("/get/:id", requiredSignIn, getSingleVehicleListing);
// Get my all vehicle listings
router.get("/get-my-all", requiredSignIn, isOwner, getMyVehicleListings);
// Update vehicle listing
router.put("/update/:id", requiredSignIn, isOwner, uploadVehiclePhotos.array("photos", 10), updateVehicleListing);
// Update vehicle status (Approved/Rejected) - ADMIN
router.patch("/admin/status/:id", requiredSignIn, isAdmin, updateVehicleStatus);
// Get all vehicle listings - ADMIN
router.get("/admin/get-all", requiredSignIn, isAdmin, getAllVehicleListings);
// Get all vehicle listings - CUSTOMER
router.get("/get-all", requiredSignIn, getAllAvailableVehicles);

export default router;