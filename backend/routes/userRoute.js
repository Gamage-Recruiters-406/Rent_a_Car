import express from 'express';
import {registerUser,
    SignIn,
    registerOwner,
    verifyEmail
} from "../controllers/userController.js"

const router = express.Router()

//uer registration route
router.post("/register", registerUser);

//login route
router.post("/login", SignIn);

//rejister as a vehicle owner
router.post("/OwnerRegistration", registerOwner);
//vehicle owner verificaton route
router.get("/verify-email", verifyEmail);

export default router;