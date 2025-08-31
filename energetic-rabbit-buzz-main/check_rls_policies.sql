-- Check and fix RLS policies for order_items table
-- This ensures admins can access all order items

-- First, check if RLS is enabled
SELECT 
  relname AS table_name,
  relrowsecurity AS rls_enabled
FROM pg_class 
WHERE relname = 'order_items';

-- Check existing policies
SELECT 
  polname AS policy_name,
  polcmd AS command,
  polqual AS using_clause,
  polwithcheck AS with_check_clause
FROM pg_policy
WHERE polrelid = 'order_items'::regclass;

-- Check if menu_items RLS is enabled
SELECT 
  relname AS table_name,
  relrowsecurity AS rls_enabled
FROM pg_class 
WHERE relname = 'menu_items';

-- Check menu_items policies
SELECT 
  polname AS policy_name,
  polcmd AS command,
  polqual AS using_clause,
  polwithcheck AS with_check_clause
FROM pg_policy
WHERE polrelid = 'menu_items'::regclass;