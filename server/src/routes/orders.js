import express from 'express';
import { getOrders, createOrder, updateOrderStatus } from '../controllers/orderController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getOrders);
router.post('/', authenticateToken, createOrder);
router.patch('/:id/status', authenticateToken, isAdmin, updateOrderStatus);

export default router;
