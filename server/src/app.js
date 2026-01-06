import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFound } from './middleware/error.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import miscRoutes from './routes/misc.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Security & Production Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable if it breaks frontend assets during dev
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());
app.use(apiLimiter);

// Static Folders
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', miscRoutes); // categories, custom-requests, upload

// Frontend Catch-all
const distPath = path.join(__dirname, '../../dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
            res.sendFile(path.join(distPath, 'index.html'));
        }
    });
}

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
