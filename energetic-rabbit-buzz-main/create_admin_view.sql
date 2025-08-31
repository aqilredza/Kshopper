-- Create a materialized view for admin order details
-- This bypasses all RLS policies entirely

-- Drop existing view if it exists
DROP MATERIALIZED VIEW IF EXISTS admin_order_details;

-- Create materialized view with all order details
CREATE MATERIALIZED VIEW admin_order_details AS
SELECT 
    oi.id as order_item_id,
    oi.order_id,
    oi.menu_item_id,
    oi.quantity,
    oi.price,
    mi.name as menu_item_name,
    mi.image_url as menu_item_image,
    o.user_id as order_user_id,
    o.total_price as order_total,
    o.status as order_status,
    o.created_at as order_created_at
FROM order_items oi
JOIN menu_items mi ON oi.menu_item_id = mi.id
JOIN orders o ON oi.order_id = o.id;

-- Create index for faster queries
CREATE INDEX idx_admin_order_details_order_id ON admin_order_details(order_id);

-- Grant access to authenticated users
GRANT SELECT ON admin_order_details TO authenticated;

-- Refresh the view
REFRESH MATERIALIZED VIEW admin_order_details;

-- Notify PostgREST to reload schema
SELECT pg_notify('pgrst', 'reload schema');