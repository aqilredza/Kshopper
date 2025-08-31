-- Script to populate existing orders with order items
-- This will help with orders that were created before the order_items table was properly used

-- First, let's see what orders we have
SELECT id, user_id, total_price, status, created_at 
FROM orders 
WHERE status != 'deleted'
ORDER BY created_at DESC
LIMIT 10;

-- Check if there are any order_items already
SELECT COUNT(*) as existing_order_items FROM order_items;

-- For orders that don't have order_items, we can create some sample ones
-- But we need to be careful not to duplicate existing ones

-- This is a complex operation that would need to be done carefully
-- For now, let's create a function that can help us debug what's happening

-- Create a view to help us see the relationship between orders and what they should contain
CREATE OR REPLACE VIEW order_debug_info AS
SELECT 
    o.id as order_id,
    o.user_id,
    o.total_price,
    o.status,
    o.created_at,
    (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count,
    CASE 
        WHEN EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id) 
        THEN 'Has Items' 
        ELSE 'No Items' 
    END as items_status
FROM orders o
WHERE o.status != 'deleted';

-- Use the view to see which orders have items and which don't
SELECT * FROM order_debug_info ORDER BY created_at DESC;