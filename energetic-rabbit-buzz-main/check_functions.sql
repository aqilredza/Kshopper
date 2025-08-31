-- Check if the functions were created
SELECT 
  proname as function_name,
  prokind as function_type,
  prosecdef as is_security_definer
FROM pg_proc
WHERE proname IN ('get_order_items_for_order', 'get_all_order_details_for_admin')
ORDER BY proname;