import { supabase } from '../config/supabaseClient.js';
import { cloudinary, isReady as cloudinaryReady } from '../config/cloudinary.js';
import fs from 'fs';
import crypto from 'crypto';

// Categories
export const getCategories = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('priority', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        next(err);
    }
};

export const saveCategory = async (req, res, next) => {
    const c = req.body;
    try {
        const { error } = await supabase
            .from('categories')
            .upsert({
                id: c.id,
                name: c.name,
                slug: c.slug,
                icon: c.icon || 'Layers',
                description: c.description,
                is_visible: c.isVisible !== false,
                priority: c.priority || 0
            });

        if (error) throw error;
        res.json({ message: 'Category saved' });
    } catch (err) {
        next(err);
    }
};

export const deleteCategory = async (req, res, next) => {
    try {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Category deleted' });
    } catch (err) {
        next(err);
    }
};

// Custom Requests
export const createCustomRequest = async (req, res, next) => {
    const { fullName, email, projectTitle, description } = req.body;
    if (!fullName || !email || !projectTitle || !description) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    const id = crypto.randomUUID();
    try {
        const { error } = await supabase
            .from('custom_requests')
            .insert({
                id: id,
                full_name: fullName,
                email: email,
                project_title: projectTitle,
                description: description
            });

        if (error) throw error;
        res.status(201).json({ message: 'Request submitted' });
    } catch (err) {
        next(err);
    }
};

export const getCustomRequests = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('custom_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data.map(r => ({
            id: r.id,
            fullName: r.full_name,
            email: r.email,
            projectTitle: r.project_title,
            description: r.description,
            status: r.status,
            createdAt: r.created_at
        })));
    } catch (err) {
        next(err);
    }
};

export const updateCustomRequestStatus = async (req, res, next) => {
    const { status } = req.body;
    try {
        const { error } = await supabase
            .from('custom_requests')
            .update({ status: status })
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Status updated' });
    } catch (err) {
        next(err);
    }
};

// Upload
export const uploadFile = async (req, res, next) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    if (cloudinaryReady) {
        try {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'payment_proofs',
                public_id: `payment_${Date.now()}`,
                resource_type: 'auto'
            });
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.json({ publicUrl: result.secure_url });
        } catch (err) {
            return res.status(500).json({ message: 'Cloud Storage Error', error: err.message });
        }
    }
    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ publicUrl });
};
