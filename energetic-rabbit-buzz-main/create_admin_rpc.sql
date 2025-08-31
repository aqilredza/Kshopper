-- Create a custom RPC function for admin to get order items
-- This bypasses RLS for admin access

CREATE OR REPLACE FUNCTION get_order_items_for_admin(order_id_param UUID)
RETURNS TABLE (
    id UUID,
    order_id UUID,
    menu_item_id UUID,
    quantity INTEGER,
    price NUMERIC,
    menu_item_name TEXT,
    menu_item_image TEXT
)
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        oi.id,
        oi.order_id,
        oi.menu_item_id,
        oi.quantity,
        oi.price,
        mi.name as menu_item_name,
        mi.image_url as menu_item_image
    FROM order_items oi
    LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
    WHERE oi.order_id = order_id_param;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_order_items_for_admin(UUID) TO authenticated;

-- Refresh schema cache
SELECT pg_notify('pgrst', 'reload schema');