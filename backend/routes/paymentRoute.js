import express from 'express';
import { isCustomer, requiredSignIn } from '../middlewares/authMiddleware.js';
import { createPayment, getPaymentsByUserId, stripeWebhook } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-payment',requiredSignIn, createPayment );
router.post('/webhook', express.raw({type: 'application/json'}), stripeWebhook );

router.get("/get-payments", requiredSignIn, isCustomer, getPaymentsByUserId);

export default router;
