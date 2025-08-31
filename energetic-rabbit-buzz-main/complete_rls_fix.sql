-- Complete reset and fix for RLS policies
-- This will ensure admins can see all data

-- Enable RLS on all tables if not already enabled
DO $$ 
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'order_items') THEN
    ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'menu_items') THEN
    ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop all existing policies
DROP POLICY IF EXISTS "admin_view_all_order_items" ON order_items;
DROP POLICY IF EXISTS "user_view_own_order_items" ON order_items;
DROP POLICY IF EXISTS "admin_view_all_menu_items" ON menu_items;
DROP POLICY IF EXISTS "authenticated_view_menu_items" ON menu_items;

-- Create simple, permissive policies for testing
-- Admin can see all order items
CREATE POLICY "admin_full_access_order_items"
ON order_items
FOR ALL
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'mredza31@gmail.com'
);

-- Users can see order items for their orders
CREATE POLICY "user_access_own_order_items"
ON order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.id = order_items.order_id 
    AND o.user_id = auth.uid()
  )
);

-- Admin can see all menu items
CREATE POLICY "admin_full_access_menu_items"
ON menu_items
FOR ALL
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'mredza31@gmail.com'
);

-- Authenticated users can see menu items
CREATE POLICY "authenticated_access_menu_items"
ON menu_items
FOR SELECT
USING (
  auth.uid() IS NOT NULL
);

-- Refresh schema cache
SELECT pg_notify('pgrst', 'reload schema');