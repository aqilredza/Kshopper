-- Create a comprehensive admin function that bypasses all security
-- This function will be SECURITY DEFINER so it runs with full privileges

CREATE OR REPLACE FUNCTION get_all_order_details_for_admin()
RETURNS TABLE (
    order_id UUID,
    order_user_id UUID,
    order_total_price NUMERIC,
    order_status TEXT,
    order_created_at TIMESTAMP WITH TIME ZONE,
    order_item_id UUID,
    menu_item_id UUID,
    menu_item_name TEXT,
    menu_item_image TEXT,
    order_item_quantity INTEGER,
    order_item_price NUMERIC
)
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id as order_id,
        o.user_id as order_user_id,
        o.total_price as order_total_price,
        o.status as order_status,
        o.created_at as order_created_at,
        oi.id as order_item_id,
        oi.menu_item_id as menu_item_id,
        mi.name as menu_item_name,
        mi.image_url as menu_item_image,
        oi.quantity as order_item_quantity,
        oi.price as order_item_price
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN menu_items mi ON oi.menu_item_id = mi.id
    ORDER BY o.created_at DESC, oi.id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_all_order_details_for_admin() TO authenticated;

-- Create a simpler function for getting items for a specific order
CREATE OR REPLACE FUNCTION get_order_items_for_order(order_id_param UUID)
RETURNS TABLE (
    order_item_id UUID,
    menu_item_id UUID,
    menu_item_name TEXT,
    menu_item_image TEXT,
    order_item_quantity INTEGER,
    order_item_price NUMERIC
)
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        oi.id as order_item_id,
        oi.menu_item_id as menu_item_id,
        mi.name as menu_item_name,
        mi.image_url as menu_item_image,
        oi.quantity as order_item_quantity,
        oi.price as order_item_price
    FROM order_items oi
    JOIN menu_items mi ON oi.menu_item_id = mi.id
    WHERE oi.order_id = order_id_param
    ORDER BY oi.id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_order_items_for_order(UUID) TO authenticated;

-- Refresh schema
SELECT pg_notify('pgrst', 'reload schema');