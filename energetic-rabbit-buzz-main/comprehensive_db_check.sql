-- Comprehensive database check to understand what's happening
-- Run this in Supabase SQL Editor

-- 1. Check if we have any orders
SELECT 'orders' as table_name, COUNT(*) as count FROM orders
UNION ALL
SELECT 'order_items' as table_name, COUNT(*) as count FROM order_items
UNION ALL
SELECT 'cart_items' as table_name, COUNT(*) as count FROM cart_items
UNION ALL
SELECT 'menu_items' as table_name, COUNT(*) as count FROM menu_items;

-- 2. Check sample orders with their details
SELECT 
    o.id as order_id,
    o.user_id,
    o.total_price,
    o.status,
    o.created_at,
    (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
FROM orders o
ORDER BY o.created_at DESC
LIMIT 10;

-- 3. Check sample order items
SELECT 
    oi.id as order_item_id,
    oi.order_id,
    oi.menu_item_id,
    oi.quantity,
    oi.price,
    mi.name as menu_item_name
FROM order_items oi
LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
ORDER BY oi.id DESC
LIMIT 10;

-- 4. Check if there are any orders without items
SELECT 
    o.id as order_id,
    o.user_id,
    o.total_price,
    o.status
FROM orders o
WHERE NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.order_id = o.id
)
ORDER BY o.created_at DESC;

-- 5. Check the structure of order_items table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'order_items'
ORDER BY ordinal_position;