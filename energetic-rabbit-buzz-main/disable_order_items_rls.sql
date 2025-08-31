-- Completely disable RLS on order_items table
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- Refresh schema
SELECT pg_notify('pgrst', 'reload schema');