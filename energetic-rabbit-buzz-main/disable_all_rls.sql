-- Completely disable RLS on all tables for testing
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;

-- Drop all policies
DROP POLICY IF EXISTS "simple_select_order_items" ON order_items;
DROP POLICY IF EXISTS "simple_select_menu_items" ON menu_items;

-- Refresh schema cache
SELECT pg_notify('pgrst', 'reload schema');