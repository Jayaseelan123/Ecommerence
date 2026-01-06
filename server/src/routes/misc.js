import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
    getCategories, saveCategory, deleteCategory,
    createCustomRequest, getCustomRequests, updateCustomRequestStatus,
    uploadFile
} from '../controllers/miscController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

const router = express.Router();

// Categories
router.get('/categories', getCategories);
router.post('/categories', authenticateToken, isAdmin, saveCategory);
router.delete('/categories/:id', authenticateToken, isAdmin, deleteCategory);

// Custom Requests
router.post('/custom-requests', createCustomRequest);
router.get('/custom-requests', authenticateToken, isAdmin, getCustomRequests);
router.patch('/custom-requests/:id/status', authenticateToken, isAdmin, updateCustomRequestStatus);

// Upload
router.post('/upload', authenticateToken, upload.single('screenshot'), uploadFile);

export default router;
