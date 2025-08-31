-- Check order items for a specific order
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
WHERE oi.order_id = 'ff46ee0e-cfd5-4a50-a310-bf9f998d579f'
LIMIT 10;