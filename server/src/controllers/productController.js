import { supabase } from '../config/supabaseClient.js';

export const getProducts = async (req, res, next) => {
    const isAdminView = req.query.isAdmin === 'true';
    try {
        let query = supabase
            .from('products')
            .select('*, product_categories(category_id)');

        if (!isAdminView) {
            query = query.eq('is_published', true);
        }

        const { data, error } = await query;
        if (error) throw error;

        const products = data.map(p => ({
            ...p,
            price: Number(p.price),
            discountPrice: p.discount_price ? Number(p.discount_price) : undefined,
            categories: p.product_categories ? p.product_categories.map(pc => pc.category_id) : [],
            features: Array.isArray(p.features) ? p.features : (p.features || []),
            isPublished: !!p.is_published,
            fullDescription: p.full_description,
            techTag: p.tech_tag,
            rootType: p.root_type,
            imageUrl: p.image_url,
            deliveryMethod: p.delivery_method,
            deliveryContent: p.delivery_content
        }));
        res.json(products);
    } catch (err) {
        next(err);
    }
};

export const saveProduct = async (req, res, next) => {
    const p = req.body;
    if (!p.id || !p.name || !p.price) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Non-transactional update due to Supabase SDK limitations
    try {
        const { error: productError } = await supabase
            .from('products')
            .upsert({
                id: p.id,
                name: p.name,
                slug: p.slug || p.name.toLowerCase().replace(/\s+/g, '-'),
                description: p.description,
                full_description: p.fullDescription,
                price: p.price,
                discount_price: p.discountPrice || null,
                root_type: p.rootType || null,
                tech_tag: p.techTag || 'Generic',
                image_url: p.imageUrl,
                features: Array.isArray(p.features) ? p.features : (p.features ? [p.features] : []),
                delivery_method: p.deliveryMethod || 'Private Link',
                delivery_content: p.deliveryContent || 'Pending',
                is_published: p.isPublished || false
            });

        if (productError) throw productError;

        if (p.categories) {
            // Delete existing
            await supabase.from('product_categories').delete().eq('product_id', p.id);

            // Insert new
            if (p.categories.length > 0) {
                const categoryInserts = p.categories.map(catId => ({
                    product_id: p.id,
                    category_id: catId
                }));
                const { error: catError } = await supabase.from('product_categories').insert(categoryInserts);
                if (catError) throw catError;
            }
        }

        res.json({ message: 'Product saved' });
    } catch (err) {
        next(err);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const { error } = await supabase.from('products').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: 'Product deleted' });
    } catch (err) {
        next(err);
    }
};
