import express from 'express';
import {registerUser,
    SignIn,
    registerOwner,
    verifyEmail,
    ReSendVerificationMail,
    logout,
    getAllUsers,
    getAllCustomers,
    getAllOwners,
    Updateuser,
    getUserDetails,
    getUserbyId,
    OwnerStatus,
    emailNotify
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
router.get("/getAllUsers",requiredSignIn, isAdmin, getAllUsers);
//get customers
router.get("/getAllCustomers", requiredSignIn, isAdmin, getAllCustomers);
//get all vehicle owners
router.get("/getAllOwners", requiredSignIn, isAdmin, getAllOwners);

//update user details
router.put("/Updateuser", requiredSignIn, Updateuser);
//get signin user details
router.get("/getUserDetails",requiredSignIn, getUserDetails);
//get user details by id, only admin can get other user details
router.get("/getUserbyId/:id",requiredSignIn, isAdmin, getUserbyId);
//update vehicle owner status
router.patch("/OwnerStatus/:id", requiredSignIn, isAdmin, OwnerStatus);
//email notification button trun off/on function
router.patch("/emailNotify",requiredSignIn, emailNotify)

export default router;