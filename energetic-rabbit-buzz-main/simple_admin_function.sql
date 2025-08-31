-- Simple function to get order items for admin
CREATE OR REPLACE FUNCTION admin_get_order_items(target_order_id UUID)
RETURNS TABLE (
    item_id UUID,
    item_menu_id UUID,
    item_name TEXT,
    item_image TEXT,
    item_qty INTEGER,
    item_price NUMERIC
)
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        oi.id,
        oi.menu_item_id,
        mi.name,
        mi.image_url,
        oi.quantity,
        oi.price
    FROM order_items oi
    JOIN menu_items mi ON oi.menu_item_id = mi.id
    WHERE oi.order_id = target_order_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION admin_get_order_items(UUID) TO authenticated;

-- Refresh schema
SELECT pg_notify('pgrst', 'reload schema');