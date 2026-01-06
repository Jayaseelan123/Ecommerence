import { supabase } from '../config/supabaseClient.js';
import transporter from '../config/mail.js';
import crypto from 'crypto';

export const getOrders = async (req, res, next) => {
    const userId = req.query.userId;
    const isAdminUser = req.user.role === 'admin';

    try {
        let query = supabase
            .from('orders')
            .select('*, users!inner(email, full_name)');

        if (!isAdminUser) {
            query = query.eq('user_id', req.user.id);
        } else if (userId && userId !== 'undefined') {
            query = query.eq('user_id', userId);
        }

        query = query.order('created_at', { ascending: false });

        const { data: orders, error } = await query;
        if (error) throw error;

        const finalizedOrders = [];

        for (const order of orders) {
            const { data: items, error: itemsError } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', order.id);

            if (itemsError) throw itemsError;

            finalizedOrders.push({
                id: order.id,
                userId: order.user_id,
                totalAmount: Number(order.total_amount),
                status: order.status,
                paymentId: order.payment_id,
                screenshotUrl: order.screenshot_url,
                transactionId: order.transaction_id,
                userEmail: order.users?.email || 'Legacy User',
                userFullName: order.users?.full_name || 'System Account',
                createdAt: order.created_at,
                items: items.map(item => ({
                    ...(typeof item.product_metadata === 'string' ? JSON.parse(item.product_metadata) : item.product_metadata || {}),
                    id: item.product_id,
                    quantity: item.quantity,
                    price: Number(item.unit_price)
                }))
            });
        }
        res.json(finalizedOrders);
    } catch (err) {
        next(err);
    }
};

export const createOrder = async (req, res, next) => {
    const order = req.body;
    if (!order.id || !order.userId || !order.totalAmount || !order.items || !order.transactionId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Non-transactional approach due to Supabase SDK limitations
    try {
        const { error: orderError } = await supabase
            .from('orders')
            .insert({
                id: order.id,
                user_id: order.userId,
                total_amount: order.totalAmount,
                status: order.status || 'Pending',
                payment_id: order.paymentId || null,
                screenshot_url: order.screenshotUrl || null,
                transaction_id: order.transactionId || null
            });

        if (orderError) throw orderError;

        const orderItems = order.items.map(item => {
            const metadata = {
                name: item.name,
                imageUrl: item.imageUrl,
                techTag: item.techTag || 'Generic',
                description: item.description,
                deliveryMethod: item.deliveryMethod || 'Private Link',
                deliveryContent: item.deliveryContent || 'Pending'
            };
            return {
                id: crypto.randomUUID(),
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                unit_price: item.discountPrice || item.price,
                product_metadata: JSON.stringify(metadata)
            };
        });

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        res.json({ message: 'Order saved' });
    } catch (err) {
        next(err);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    const { status } = req.body;
    const orderId = req.params.id;

    try {
        const { error: updateError } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId);

        if (updateError) throw updateError;

        if (status === 'Completed') {
            const { data: orders, error: orderError } = await supabase
                .from('orders')
                .select('*, users!inner(email, full_name)')
                .eq('id', orderId)
                .single();

            if (orderError) throw orderError;

            const orderDetail = orders;
            if (orderDetail) {
                const { data: items, error: itemsError } = await supabase
                    .from('order_items')
                    .select('*')
                    .eq('order_id', orderId);

                if (itemsError) throw itemsError;

                const itemListHtml = items.map(item => {
                    const metadata = typeof item.product_metadata === 'string' ? JSON.parse(item.product_metadata) : item.product_metadata || {};
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
                    to: orderDetail.users.email,
                    subject: `🚀 Your Assets are Ready! (Order ID: ${orderId.slice(0, 8).toUpperCase()})`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                            <div style="background-color: #0d1117; color: white; padding: 30px; text-align: center;">
                                <h1 style="margin: 0; color: #00d2ff; font-style: italic;">Developers Hub</h1>
                                <p style="margin: 5px 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Asset Deployment Manifest</p>
                            </div>
                            <div style="padding: 30px;">
                                <h2 style="color: #333;">Hello ${orderDetail.users.full_name},</h2>
                                <p>Your payment has been verified successfully. Your high-performance engineering assets are now ready for deployment.</p>
                                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <h3 style="margin-top: 0; font-size: 16px; border-bottom: 2px solid #ddd; padding-bottom: 10px;">Payload Contents:</h3>
                                    <table style="width: 100%; border-collapse: collapse;">
                                        ${itemListHtml}
                                    </table>
                                </div>
                            </div>
                        </div>
                    `
                };

                try {
                    await transporter.sendMail(mailOptions);
                } catch (emailError) {
                    console.error('❌ Email Failed:', emailError.message);
                }
            }
        }
        res.json({ message: 'Order status updated' });
    } catch (err) {
        next(err);
    }
};
