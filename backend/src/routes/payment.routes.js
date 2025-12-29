import express from 'express';
import { paymentController } from '../controllers/payment.controller.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/create-order-split', auth, paymentController.createSplitOrder);
router.post('/create-order', auth, paymentController.createOrder);
router.post('/verify', auth, paymentController.verifyPayment);

export default router;
