import { supabase } from '../config/supabaseClient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const signup = async (req, res, next) => {
    const { id, email, password, full_name, role } = req.body;
    if (!id || !email || !password || !full_name) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { error } = await supabase.from('users').insert({
            id,
            email,
            password: hashedPassword,
            full_name,
            role: role || 'user'
        });

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ message: 'Email already exists' });
            }
            throw error;
        }
        res.status(201).json({ message: 'User created' });
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is 'No rows found'
            throw error;
        }

        const user = data;

        if (!user) {
            return res.status(401).json({ message: 'Account not found' });
        }

        const isMatch = user.password.startsWith('$2')
            ? await bcrypt.compare(password, user.password)
            : password === user.password;

        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role }
        });
    } catch (err) {
        next(err);
    }
};

export const getMe = (req, res) => {
    res.json(req.user);
};
