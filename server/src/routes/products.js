import express from 'express';
import { getProducts, saveProduct, deleteProduct } from '../controllers/productController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProducts);
router.post('/', authenticateToken, isAdmin, saveProduct);
router.delete('/:id', authenticateToken, isAdmin, deleteProduct);

export default router;
