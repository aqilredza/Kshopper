-- Check policies on orders table specifically
SELECT 
  polname AS policy_name,
  polcmd AS command,
  polqual AS using_clause,
  polwithcheck AS with_check_clause
FROM pg_policy
WHERE polrelid = 'orders'::regclass;

-- Check if RLS is enabled on orders
SELECT 
  relname AS table_name,
  relrowsecurity AS rls_enabled
FROM pg_class 
WHERE relname = 'orders';

-- Temporarily disable RLS on orders as well
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Refresh schema cache
SELECT pg_notify('pgrst', 'reload schema');