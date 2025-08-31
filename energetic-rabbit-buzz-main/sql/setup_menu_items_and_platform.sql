-- Create platforms table (renamed from restaurant_platforms for clarity)
CREATE TABLE IF NOT EXISTS platforms (
    id SERIAL PRIMARY KEY,
    name TEXT DEFAULT 'Default Platform',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default platform if none exists

-- Insert a default platform if none exists
INSERT INTO platforms (name)
SELECT 'Default Platform'
WHERE NOT EXISTS (SELECT 1 FROM platforms);

-- Create menu_items table

-- Create menu_items table, referencing platforms
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    image_url TEXT,
    category TEXT NOT NULL,
    platform_id INTEGER NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
