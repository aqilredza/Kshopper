-- Script to verify table structure and relationships
-- Run this in Supabase SQL Editor to check if tables are set up correctly

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'order_items', 'menu_items')
ORDER BY table_name;

-- Check order_items table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'order_items'
ORDER BY ordinal_position;

-- Check menu_items table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'menu_items'
ORDER BY ordinal_position;

-- Check if there are any orders
SELECT COUNT(*) as order_count FROM orders;

-- Check if there are any order items
SELECT COUNT(*) as order_items_count FROM order_items;

-- Check if there are any menu items
SELECT COUNT(*) as menu_items_count FROM menu_items;

-- Check sample data from each table
SELECT 'orders' as table_name, id, user_id, status FROM orders LIMIT 3;
SELECT 'order_items' as table_name, id, order_id, menu_item_id FROM order_items LIMIT 3;
SELECT 'menu_items' as table_name, id, name FROM menu_items LIMIT 3;