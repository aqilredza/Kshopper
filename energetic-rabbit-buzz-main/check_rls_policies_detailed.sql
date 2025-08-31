-- Check RLS policies on order_items table
SELECT 
  polname AS policy_name,
  polcmd AS command,
  polqual AS using_clause,
  polwithcheck AS with_check_clause
FROM pg_policy
WHERE polrelid = 'order_items'::regclass;

-- Check if RLS is enabled on order_items
SELECT 
  relname AS table_name,
  relrowsecurity AS rls_enabled
FROM pg_class 
WHERE relname = 'order_items';

-- Check RLS policies on menu_items table
SELECT 
  polname AS policy_name,
  polcmd AS command,
  polqual AS using_clause,
  polwithcheck AS with_check_clause
FROM pg_policy
WHERE polrelid = 'menu_items'::regclass;

-- Check if RLS is enabled on menu_items
SELECT 
  relname AS table_name,
  relrowsecurity AS rls_enabled
FROM pg_class 
WHERE relname = 'menu_items';