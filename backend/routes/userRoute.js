import express from 'express';
import {registerUser,
    SignIn,
} from "../controllers/userController.js"

const router = express.Router()

//uer registration route
router.post("/register", registerUser);

//login route
router.post("/login", SignIn);

export default router;