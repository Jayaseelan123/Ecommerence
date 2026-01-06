const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env vars immediately at the top
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('📝 Environment variables loaded from .env');
} else {
    console.warn('⚠️ No .env file found at:', envPath);
}

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary').v2;

let cloudinaryReady = false;
try {
    const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').replace(/^["']|["']$/g, '').trim();
    const apiKey = (process.env.CLOUDINARY_API_KEY || '').replace(/^["']|["']$/g, '').trim();
    const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').replace(/^["']|["']$/g, '').trim();

    if (cloudName && apiKey && apiSecret && !apiSecret.includes('PASTE_YOUR')) {
        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true
        });
        cloudinaryReady = true;
        console.log('✅ Cloudinary engine initialized and ready for deployment');
    } else {
        const missing = [];
        if (!cloudName) missing.push('CLOUD_NAME');
        if (!apiKey) missing.push('API_KEY');
        if (!apiSecret || apiSecret.includes('PASTE_YOUR')) missing.push('API_SECRET');
        console.warn('⚠️ Cloudinary configuration incomplete. Missing:', missing.join(', '));
    }
} catch (cdnErr) {
    console.error('❌ Cloudinary initialization failed:', cdnErr.message);
}

// SMTP configuration for email delivery
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: (process.env.SMTP_USER || '').trim(),
        pass: (process.env.SMTP_PASS || '').trim(),
    },
});

// Verify transporter
transporter.verify((error, success) => {
    if (error) {
        console.warn('⚠️ SMTP Server Connection Error. Email delivery might fail:', error.message);
    } else {
        console.log('📧 SMTP Server is ready to deliver messages');
    }
});

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', true);
app.use(cors());
app.use(express.json());
// Serve uploads folder as public
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// MySQL Connection - Supports local and Railway injected variables
const pool = mysql.createPool({
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '1234',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'devhub_db',
    port: process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(conn => {
        console.log(`✅ MySQL Connected to ${process.env.DB_NAME || 'devhub_db'} as ${process.env.DB_USER || 'root'}`);
        conn.release();
    })
    .catch(err => {
        console.error('❌ MySQL Connection Error:', err.message);
    });

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log(`🔍 Auth Header: ${authHeader}`);
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.warn('⚠️ No token found in Authorization header');
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
        if (err) {
            console.error(`❌ JWT Verification Error: ${err.message}`);
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

const isAdmin = (req, res, next) => {
    console.log(`🛡️ Checking Admin Role for User ID: ${req.user ? req.user.id : 'none'}, Role: ${req.user ? req.user.role : 'none'}`);
    if (req.user && String(req.user.role).toLowerCase() === 'admin') {
        next();
    } else {
        const role = req.user ? req.user.role : 'none';
        console.warn(`🚫 Admin access denied for user with role: ${role}`);
        res.status(403).json({
            message: 'Admin access required',
            debug: { role: role }
        });
    }
};

// Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Routes

// 1. Auth
app.post('/api/auth/signup', async (req, res) => {
    const { id, email, password, full_name, role } = req.body;
    console.log(`📝 Signup attempt: ${email}`);

    if (!id || !email || !password || !full_name) {
        console.warn('⚠️ Missing required fields for signup');
        return res.status(400).json({ message: 'All fields (id, email, password, full_name) are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.execute(
            'INSERT INTO users (id, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
            [id, email, hashedPassword, full_name, role || 'user']
        );
        console.log(`✅ User registered successfully: ${email}`);
        res.status(201).json({ message: 'User created' });
    } catch (err) {
        console.error('❌ Signup Error:', err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'An account with this email already exists.' });
        }
        res.status(500).json({ message: 'Registration failed. Please try again later.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`🔑 Login attempt: ${email}`);
    try {
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            console.warn(`⚠️ Login failed: User ${email} not found`);
            return res.status(401).json({ message: 'No account found with this email.' });
        }

        const isBcryptMatch = user.password && user.password.startsWith('$2') ? await bcrypt.compare(password, user.password) : false;
        const isPlainMatch = password === user.password;

        if (!isBcryptMatch && !isPlainMatch) {
            console.warn(`⚠️ Login failed: Incorrect password for ${email}`);
            return res.status(401).json({ message: 'Incorrect password. Please try again.' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret');
        console.log(`✅ Login successful: ${email} (${user.role})`);
        res.json({ token, user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role } });
    } catch (err) {
        console.error('❌ Login Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    res.json(req.user);
});

// 2. Categories
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM categories ORDER BY priority ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/categories', authenticateToken, isAdmin, async (req, res) => {
    const c = req.body;
    console.log(`📂 Saving Category: ${c.name} (id: ${c.id})`);
    try {
        await pool.execute(
            `INSERT INTO categories (id, name, slug, icon, description, is_visible, priority) 
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE name=?, slug=?, icon=?, description=?, is_visible=?, priority=?`,
            [
                c.id, c.name, c.slug, c.icon || 'Layers', c.description, c.isVisible ? 1 : 0, c.priority || 0,
                c.name, c.slug, c.icon || 'Layers', c.description, c.isVisible ? 1 : 0, c.priority || 0
            ]
        );
        console.log(`✅ Category saved: ${c.name}`);
        res.json({ message: 'Category saved' });
    } catch (err) {
        console.error('❌ Save Category Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/categories/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await pool.execute('DELETE FROM categories WHERE id = ?', [req.params.id]);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Products
app.get('/api/products', async (req, res) => {
    const isAdminView = req.query.isAdmin === 'true';
    try {
        let sql = `
            SELECT p.*, GROUP_CONCAT(pc.category_id) as categories 
            FROM products p 
            LEFT JOIN product_categories pc ON p.id = pc.product_id
        `;
        if (!isAdminView) {
            sql += ' WHERE p.is_published = 1';
        }
        sql += ' GROUP BY p.id';
        const [rows] = await pool.execute(sql);

        const products = rows.map(p => ({
            ...p,
            price: Number(p.price),
            discountPrice: p.discount_price ? Number(p.discount_price) : undefined,
            categories: p.categories ? p.categories.split(',') : [],
            features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
            isPublished: !!p.is_published,
            fullDescription: p.full_description,
            techTag: p.tech_tag,
            imageUrl: p.image_url,
            deliveryMethod: p.delivery_method,
            deliveryContent: p.delivery_content
        }));
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', authenticateToken, isAdmin, async (req, res) => {
    const p = req.body;
    console.log(`📦 Saving product: ${p.name} (${p.id})`);

    // Validate required fields
    if (!p.id || !p.name || !p.price) {
        console.warn('⚠️ Missing required fields for product save');
        return res.status(400).json({ message: 'Missing required fields (id, name, price)' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        console.log('🔄 Executing product INSERT/UPDATE...');
        await connection.execute(
            `INSERT INTO products (id, name, slug, description, full_description, price, discount_price, tech_tag, image_url, features, delivery_method, delivery_content, is_published) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE name=?, slug=?, description=?, full_description=?, price=?, discount_price=?, tech_tag=?, image_url=?, features=?, delivery_method=?, delivery_content=?, is_published=?`,
            [
                p.id, p.name, p.slug || p.name.toLowerCase().replace(/\s+/g, '-'), p.description, p.fullDescription, p.price, p.discountPrice || null, p.techTag || 'Generic', p.imageUrl, JSON.stringify(p.features || []), p.deliveryMethod || 'Private Link', p.deliveryContent || 'Pending', p.isPublished ? 1 : 0,
                p.name, p.slug || p.name.toLowerCase().replace(/\s+/g, '-'), p.description, p.fullDescription, p.price, p.discountPrice || null, p.techTag || 'Generic', p.imageUrl, JSON.stringify(p.features || []), p.deliveryMethod || 'Private Link', p.deliveryContent || 'Pending', p.isPublished ? 1 : 0
            ]
        );

        if (p.categories && p.categories.length > 0) {
            console.log(`🔗 Linking categories: ${p.categories.join(', ')}`);
            await connection.execute('DELETE FROM product_categories WHERE product_id = ?', [p.id]);
            for (const catId of p.categories) {
                // Ensure category exists to prevent foreign key errors (optional safety)
                await connection.execute('INSERT IGNORE INTO product_categories (product_id, category_id) VALUES (?, ?)', [p.id, catId]);
            }
        }

        await connection.commit();
        console.log('✅ Product saved successfully');
        res.json({ message: 'Product saved' });
    } catch (err) {
        await connection.rollback();
        console.error('❌ Save Product Error:', err.message);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

app.delete('/api/products/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
    const userId = req.query.userId;
    const isAdminUser = req.user.role === 'admin';

    console.log(`🔍 Order Fetch: Requesting user role: ${req.user.role}, Requested filter userId: ${userId || 'None'}`);

    try {
        let sql = `
            SELECT o.*, u.email as user_email, u.full_name as user_full_name
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
        `;
        let params = [];

        // Admin gets all by default unless filtering by a specific user.
        // User always gets only their own.
        if (!isAdminUser) {
            sql += ' WHERE o.user_id = ?';
            params.push(req.user.id);
            console.log(`🔒 User filter applied for ID: ${req.user.id}`);
        } else if (userId && userId !== 'undefined') {
            sql += ' WHERE o.user_id = ?';
            params.push(userId);
            console.log(`🔍 Admin filter applied for User ID: ${userId}`);
        }

        sql += ' ORDER BY o.created_at DESC';

        const [orders] = await pool.execute(sql, params);
        console.log(`📦 Found ${orders.length} orders in database`);

        const finalizedOrders = [];
        for (const order of orders) {
            const [items] = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [order.id]);

            // Map DB fields to camelCase for frontend compatibility
            finalizedOrders.push({
                id: order.id,
                userId: order.user_id,
                totalAmount: Number(order.total_amount),
                status: order.status,
                paymentId: order.payment_id,
                screenshotUrl: order.screenshot_url,
                transactionId: order.transaction_id,
                userEmail: order.user_email || 'Legacy User',
                userFullName: order.user_full_name || 'System Account',
                createdAt: order.created_at,
                items: items.map(item => {
                    let metadata = {};
                    try {
                        metadata = typeof item.product_metadata === 'string'
                            ? JSON.parse(item.product_metadata)
                            : item.product_metadata;
                    } catch (e) {
                        console.error('Failed to parse metadata for item:', item.id);
                    }
                    return {
                        ...metadata,
                        id: item.product_id,
                        quantity: item.quantity,
                        price: Number(item.unit_price) // Ensure price is included
                    };
                })
            });
        }
        res.json(finalizedOrders);
    } catch (err) {
        console.error('❌ Get Orders Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', authenticateToken, async (req, res) => {
    const order = req.body;
    console.log(`📦 Saving Order: ${order.id} for User: ${order.userId}`);

    // Validate required fields
    if (!order.id || !order.userId || !order.totalAmount || !order.items || !order.transactionId) {
        console.warn('⚠️ Missing required fields for order save (id, userId, totalAmount, items, or transactionId)');
        return res.status(400).json({ message: 'Missing required fields. Transaction ID is mandatory.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        console.log('🔄 inserting order record...');
        await connection.execute(
            'INSERT INTO orders (id, user_id, total_amount, status, payment_id, screenshot_url, transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                order.id,
                order.userId,
                order.totalAmount,
                order.status || 'Pending',
                order.paymentId || null,
                order.screenshotUrl || null,
                order.transactionId || null
            ]
        );

        console.log(`🔄 inserting ${order.items.length} order items...`);
        for (const item of order.items) {
            const metadata = {
                name: item.name,
                imageUrl: item.imageUrl,
                techTag: item.techTag || 'Generic',
                description: item.description,
                deliveryMethod: item.deliveryMethod || 'Private Link',
                deliveryContent: item.deliveryContent || 'Pending'
            };
            await connection.execute(
                'INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, product_metadata) VALUES (?, ?, ?, ?, ?, ?)',
                [crypto.randomUUID(), order.id, item.id, item.quantity, item.discountPrice || item.price, JSON.stringify(metadata)]
            );
        }

        await connection.commit();
        console.log('✅ Order saved successfully');
        res.json({ message: 'Order saved' });
    } catch (err) {
        await connection.rollback();
        console.error('❌ Save Order Error:', err.message);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

app.patch('/api/orders/:id/status', authenticateToken, isAdmin, async (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;

    try {
        // Update order status
        await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);

        // If status is "Completed", send delivery email
        if (status === 'Completed') {
            const [orders] = await pool.execute(`
                SELECT o.*, u.email, u.full_name
                FROM orders o
                JOIN users u ON o.user_id = u.id
                WHERE o.id = ?
            `, [orderId]);

            const orderDetail = orders[0];
            if (orderDetail) {
                const [items] = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

                const itemListHtml = items.map(item => {
                    let metadata = {};
                    try {
                        metadata = typeof item.product_metadata === 'string'
                            ? JSON.parse(item.product_metadata)
                            : item.product_metadata;
                    } catch (e) {
                        console.error('Failed to parse metadata for item in email:', item.id);
                        metadata = item.product_metadata || {};
                    }
                    return `
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                                <strong>${metadata.name || 'Digital Asset'}</strong><br>
                                <span style="font-size: 12px; color: #666;">${metadata.techTag || 'Generic'}</span>
                            </td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                                <a href="${metadata.deliveryContent || '#'}" style="display: inline-block; padding: 8px 16px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Access Resource</a>
                            </td>
                        </tr>
                    `;
                }).join('');

                const mailOptions = {
                    from: `"Developers Hub" <${process.env.SMTP_USER}>`,
                    to: orderDetail.email,
                    subject: `🚀 Your Assets are Ready! (Order ID: ${orderId.slice(0, 8).toUpperCase()})`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                            <div style="background-color: #0d1117; color: white; padding: 30px; text-align: center;">
                                <h1 style="margin: 0; color: #00d2ff; font-style: italic;">Developers Hub</h1>
                                <p style="margin: 5px 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Asset Deployment Manifest</p>
                            </div>
                            <div style="padding: 30px;">
                                <h2 style="color: #333;">Hello ${orderDetail.full_name},</h2>
                                <p>Your payment has been verified successfully. Your high-performance engineering assets are now ready for deployment.</p>
                                
                                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <h3 style="margin-top: 0; font-size: 16px; border-bottom: 2px solid #ddd; padding-bottom: 10px;">Payload Contents:</h3>
                                    <table style="width: 100%; border-collapse: collapse;">
                                        ${itemListHtml}
                                    </table>
                                </div>

                                <p style="font-size: 14px; color: #666;">Note: These links are secure. Please do not share this email. You can also access these resources from your dashboard anytime.</p>
                                
                                <div style="text-align: center; margin-top: 30px;">
                                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="padding: 15px 30px; background-color: #00d2ff; color: #0d1117; text-decoration: none; border-radius: 5px; font-weight: bold; text-transform: uppercase;">View Your Dashboard</a>
                                </div>
                            </div>
                            <div style="background-color: #eee; padding: 20px; text-align: center; font-size: 12px; color: #888;">
                                <p>&copy; ${new Date().getFullYear()} Developers Hub. Universal Asset Framework.</p>
                            </div>
                        </div>
                    `
                };

                try {
                    await transporter.sendMail(mailOptions);
                    console.log(`✅ Delivery email sent to: ${orderDetail.email}`);
                } catch (emailError) {
                    console.error('❌ Failed to send delivery email:', emailError.message);
                }
            }
        }

        res.json({ message: 'Order status updated and notification dispatched' });
    } catch (err) {
        console.error('❌ Order Status Update Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 5. Screenshot Upload
app.post('/api/upload', authenticateToken, upload.single('screenshot'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    if (cloudinaryReady) {
        try {
            console.log(`🚀 Uploading to Cloudinary: ${req.file.originalname}`);

            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'payment_proofs',
                public_id: `payment_${Date.now()}`,
                resource_type: 'auto'
            });

            // Cleanup local file immediately
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            console.log(`✅ Cloudinary Upload Success: ${result.public_id}`);
            return res.json({ publicUrl: result.secure_url });

        } catch (err) {
            console.error('❌ Cloudinary Upload Error:', err.message);
            return res.status(500).json({
                message: 'Cloud Storage Error',
                error: err.message,
                details: 'Please check your Cloudinary credentials in the .env file.'
            });
        }
    }

    // Local Fallback (only if Cloudinary is not configured)
    console.warn('⚡ Cloudinary not configured, using local fallback');
    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ publicUrl });
});

// 6. Custom Requests
app.post('/api/custom-requests', async (req, res) => {
    const { fullName, email, projectTitle, description } = req.body;
    if (!fullName || !email || !projectTitle || !description) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    const id = crypto.randomUUID();
    try {
        await pool.execute(
            'INSERT INTO custom_requests (id, full_name, email, project_title, description) VALUES (?, ?, ?, ?, ?)',
            [id, fullName, email, projectTitle, description]
        );
        res.status(201).json({ message: 'Request submitted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/custom-requests', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM custom_requests ORDER BY created_at DESC');
        res.json(rows.map(r => ({
            id: r.id,
            fullName: r.full_name,
            email: r.email,
            projectTitle: r.project_title,
            description: r.description,
            status: r.status,
            createdAt: r.created_at
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/custom-requests/:id/status', authenticateToken, isAdmin, async (req, res) => {
    const { status } = req.body;
    try {
        await pool.execute('UPDATE custom_requests SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Request status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        // Exclude /api and /uploads from catch-all
        if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
            res.sendFile(path.join(distPath, 'index.html'));
        }
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
