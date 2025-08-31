-- Check all policies and disable RLS temporarily for debugging
-- This will help us identify the exact issue

-- Check what policies exist
SELECT 
  tablename,
  polname,
  polcmd,
  polqual
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE cls.relname IN ('orders', 'order_items', 'menu_items', 'profiles')
ORDER BY tablename, polname;

-- Disable RLS temporarily on order_items for debugging
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- Disable RLS temporarily on menu_items for debugging
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;

-- Test access now
SELECT pg_notify('pgrst', 'reload schema');