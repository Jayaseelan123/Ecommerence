import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
        if (err) {
            console.error(`❌ JWT Error: ${err.message}`);
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

export const isAdmin = (req, res, next) => {
    if (req.user && String(req.user.role).toLowerCase() === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};
