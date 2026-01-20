import express from 'express';
import {registerUser,
    SignIn,
    registerOwner,
    verifyEmail,
    ReSendVerificationMail,
    logout,
    getAllUsers,
    getAllCustomers,
    getAllOwners
} from "../controllers/userController.js"

import { requiredSignIn, isOwner, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router()

//user registration route
router.post("/register", registerUser);

//login route
router.post("/login", SignIn);
//logout function
router.post("/logout", requiredSignIn, logout);

//register as a vehicle owner
router.post("/OwnerRegistration", registerOwner);
//vehicle owner verificaton route
router.get("/verify-email", verifyEmail);

//get verify email again
router.patch("/getVerificationMail",requiredSignIn, isOwner, ReSendVerificationMail);

//get all users except admins
router.get("/getAllUsers",requiredSignIn, isAdmin, getAllUsers)
//get customers
router.get("/getAllCustomers", requiredSignIn, isAdmin, getAllCustomers)
//get all vehicle owners
router.get("/getAllOwners", requiredSignIn, isAdmin, getAllOwners)

export default router;