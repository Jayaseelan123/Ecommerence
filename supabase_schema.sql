-- Supabase / PostgreSQL Schema for Developers Hub

-- 1. Create Custom Types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('Pending', 'Awaiting Verification', 'Completed', 'Failed', 'Refunded');
    END IF;
END $$;

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(100) NOT NULL,
    description TEXT,
    is_visible BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    full_description TEXT,
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2),
    tech_tag VARCHAR(100) NOT NULL,
    image_url TEXT,
    features JSONB, 
    delivery_method VARCHAR(100) NOT NULL,
    delivery_content TEXT NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. JUNCTION: PRODUCT_CATEGORIES
CREATE TABLE IF NOT EXISTS product_categories (
    product_id VARCHAR(50),
    category_id VARCHAR(50),
    PRIMARY KEY (product_id, category_id),
    CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 6. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status order_status DEFAULT 'Pending',
    payment_id VARCHAR(255),
    screenshot_url TEXT,
    transaction_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. ORDER_ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL,
    product_id VARCHAR(50),
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    product_metadata JSONB,
    CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_product_item FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- 8. CUSTOM_REQUESTS
CREATE TABLE IF NOT EXISTS custom_requests (
    id VARCHAR(255) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. INITIAL DATA
INSERT INTO categories (id, name, slug, icon, description, priority) VALUES 
('cat-ai', 'AI Automation', 'ai-automation', 'Zap', 'Workflows for Make, n8n, and custom AI agents.', 1),
('cat-soft', 'Software', 'software', 'Code', 'Production-ready web apps and landing pages.', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, slug, description, full_description, price, discount_price, tech_tag, image_url, features, delivery_method, delivery_content, is_published) VALUES 
('p1', 'AI Lead Researcher', 'ai-lead-researcher', 'Automated lead generation using OpenAI and Make.com', 'A comprehensive workflow...', 49.00, 29.00, 'Make.com', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800', '["API Integration"]'::jsonb, 'File Download', 'https://example.com/download/ai-lead-gen.json', TRUE),
('p2', 'SaaS Dashboard Pro', 'saas-dashboard-pro', 'Full-stack Next.js admin template with auth.', 'A complete SaaS boilerplate...', 99.00, 79.00, 'Next.js', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800', '["Auth Ready"]'::jsonb, 'Private Link', 'https://github.com/autoflow/dashboard-pro-private', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_categories (product_id, category_id) VALUES 
('p1', 'cat-ai'), 
('p2', 'cat-soft')
ON CONFLICT DO NOTHING;

-- DEFAULT ADMIN (Password: admin123 - should be hashed in production)
INSERT INTO users (id, full_name, email, password, role) VALUES 
('admin-id-1', 'Admin', 'admin@devhub.com', 'admin123', 'admin')
ON CONFLICT (email) DO NOTHING;
