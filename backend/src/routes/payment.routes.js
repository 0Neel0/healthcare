import express from 'express';
import { paymentController } from '../controllers/payment.controller.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/create-order', auth, paymentController.createSplitOrder);
router.post('/verify', auth, paymentController.verifyPayment);

export default router;
