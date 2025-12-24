import express from 'express';
import {
    getInventory,
    addItem,
    updateItem,
    deleteItem,
    getLowStockItems
} from '../controllers/inventory.controller.js';

const router = express.Router();

router.get('/', getInventory);
router.post('/', addItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.get('/low-stock', getLowStockItems);

export default router;
