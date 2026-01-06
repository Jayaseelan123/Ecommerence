import { Product, Category, Order, OrderStatus } from '../types';

const isProd = import.meta.env.PROD;
// In production (Vercel), use relative URLs. In development, use localhost:5000
// Don't use VITE_API_URL in production - it should be empty or undefined
const BASE_URL = isProd ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5000');
const API_URL = `${BASE_URL}/api`;

const getHeaders = () => {
    const token = localStorage.getItem('devhub_token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const supabaseService = {
    // Auth
    async signUp(email: string, password: string, fullName: string) {
        const userId = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 15);

        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: userId, email, password, full_name: fullName })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Signup failed');
        }
        return response.json();
    },

    async signIn(email: string, password: string) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }
        const data = await response.json();
        localStorage.setItem('devhub_token', data.token);
        localStorage.setItem('devhub_user', JSON.stringify(data.user));
        return data;
    },

    async signOut() {
        localStorage.removeItem('devhub_token');
        localStorage.removeItem('devhub_user');
    },

    async getCurrentUser() {
        const userStr = localStorage.getItem('devhub_user');
        if (!userStr) return null;
        return JSON.parse(userStr);
    },

    // Categories
    async getCategories(): Promise<Category[]> {
        const response = await fetch(`${API_URL}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        return response.json();
    },

    async saveCategory(category: Category): Promise<void> {
        const response = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(category)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to save category');
        }
    },

    async deleteCategory(id: string) {
        const response = await fetch(`${API_URL}/categories/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Delete Category failed');
        return response.json();
    },

    // Custom Requests
    async submitCustomRequest(data: any) {
        const response = await fetch(`${API_URL}/custom-requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Request submission failed');
        return response.json();
    },

    async getCustomRequests() {
        const response = await fetch(`${API_URL}/custom-requests`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Fetch requests failed');
        return response.json();
    },

    async updateRequestStatus(id: string, status: string) {
        const response = await fetch(`${API_URL}/custom-requests/${id}/status`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Update status failed');
        return response.json();
    },

    // Products
    async getProducts(includeUnpublished = false): Promise<Product[]> {
        const response = await fetch(`${API_URL}/products?isAdmin=${includeUnpublished}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
    },

    async saveProduct(product: Product): Promise<void> {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(product)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to save product');
        }
    },

    async deleteProduct(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete product');
        }
    },

    // Orders
    async getOrders(userId?: string): Promise<Order[]> {
        const url = userId ? `${API_URL}/orders?userId=${userId}` : `${API_URL}/orders`;
        const response = await fetch(url, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch orders');
        return response.json();
    },

    async saveOrder(order: Order): Promise<void> {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(order)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to save order');
        }
    },

    async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
        const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ status })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update order status');
        }
    },

    async uploadScreenshot(orderId: string, file: File): Promise<string> {
        const formData = new FormData();
        formData.append('screenshot', file);
        formData.append('orderId', orderId);

        const token = localStorage.getItem('devhub_token');
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Upload failed');
        }
        const data = await response.json();
        return data.publicUrl;
    }
};

// Exporting a dummy supabase object for compatibility where it's used directly
export const supabase = {
    auth: {
        onAuthStateChange: (cb: any) => {
            const userStr = localStorage.getItem('devhub_user');
            if (userStr) {
                const user = JSON.parse(userStr);
                // Simulate Supabase session structure
                cb('SIGNED_IN', {
                    user: {
                        id: user.id,
                        email: user.email,
                        user_metadata: {
                            full_name: user.fullName,
                            role: user.role
                        }
                    }
                });
            } else {
                cb('SIGNED_OUT', null);
            }
            return { data: { subscription: { unsubscribe: () => { } } } };
        }
    }
};
