import express from 'express';
import {registerUser,
    SignIn,
    registerOwner,
    verifyEmail,
    ReSendVerificationMail,
    logout
} from "../controllers/userController.js"

import { requiredSignIn, isOwner } from '../middlewares/authMiddleware.js';

const router = express.Router()

//uer registration route
router.post("/register", registerUser);

//login route
router.post("/login", SignIn);
//logout function
router.post("/logout", requiredSignIn, logout);

//rejister as a vehicle owner
router.post("/OwnerRegistration", registerOwner);
//vehicle owner verificaton route
router.get("/verify-email", verifyEmail);

//get verify email again
router.patch("/getVerificationMail",requiredSignIn, isOwner, ReSendVerificationMail);

export default router;