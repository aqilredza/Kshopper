-- Check what's in the orders table
SELECT 
    id,
    user_id,
    total_price,
    status,
    created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;

-- Check if there are any order items
SELECT 
    id,
    order_id,
    menu_item_id,
    quantity,
    price
FROM order_items
LIMIT 10;

-- Check if order items exist for any orders
SELECT 
    o.id as order_id,
    o.total_price,
    o.status,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.total_price, o.status
ORDER BY o.created_at DESC
LIMIT 10;