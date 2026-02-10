import express from 'express';
import { requiredSignIn } from '../middlewares/authMiddleware.js';
import { createPayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-payment',requiredSignIn, createPayment )

export default router;
