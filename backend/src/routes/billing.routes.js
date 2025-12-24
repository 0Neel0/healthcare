import express from 'express';
import {
    createInvoice,
    getInvoices,
    getInvoiceById,
    updatePaymentStatus
} from '../controllers/billing.controller.js';

const router = express.Router();

router.post('/', createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id/payment', updatePaymentStatus);

export default router;
