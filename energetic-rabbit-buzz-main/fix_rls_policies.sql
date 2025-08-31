-- Complete fix for RLS policies to ensure admins can see all order items
-- Run this in Supabase SQL Editor

-- Enable RLS on order_items if not already enabled
DO $$ 
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'order_items') THEN
    ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'menu_items') THEN
    ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop all existing policies on order_items
DROP POLICY IF EXISTS "admin_all_order_items" ON order_items;
DROP POLICY IF EXISTS "user_own_order_items" ON order_items;
DROP POLICY IF EXISTS "Admin can view all order items" ON order_items;
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;

-- Create new policies for order_items
-- Admin policy - allow admin to see all order items
CREATE POLICY "admin_all_order_items"
ON order_items
FOR ALL
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'mredza31@gmail.com'
);

-- User policy - allow users to see their own order items
CREATE POLICY "user_own_order_items"
ON order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.id = order_items.order_id 
    AND o.user_id = auth.uid()
  )
);

-- Drop all existing policies on menu_items
DROP POLICY IF EXISTS "admin_all_menu_items" ON menu_items;
DROP POLICY IF EXISTS "authenticated_menu_items" ON menu_items;
DROP POLICY IF EXISTS "Admin can view all menu items" ON menu_items;
DROP POLICY IF EXISTS "Public can view available menu items" ON menu_items;

-- Create new policies for menu_items
-- Admin policy - allow admin to see all menu items
CREATE POLICY "admin_all_menu_items"
ON menu_items
FOR ALL
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'mredza31@gmail.com'
);

-- General policy - allow authenticated users to see menu items
CREATE POLICY "authenticated_menu_items"
ON menu_items
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
);

-- Refresh schema cache
SELECT pg_notify('pgrst', 'reload schema');