-- Complete fix for admin access to all order items
-- This script will reset and properly configure RLS policies

-- 1. Enable RLS on all relevant tables if not already enabled
DO $$ 
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'order_items') THEN
    ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'menu_items') THEN
    ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 2. Drop all existing policies on order_items
DROP POLICY IF EXISTS "Admin can view all order items" ON order_items;
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
DROP POLICY IF EXISTS "Admin can manage all order items" ON order_items;
DROP POLICY IF EXISTS "Allow all authenticated users to view order items" ON order_items;

-- 3. Create new policies for order_items
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

-- 4. Drop all existing policies on menu_items
DROP POLICY IF EXISTS "Admin can view all menu items" ON menu_items;
DROP POLICY IF EXISTS "Public can view available menu items" ON menu_items;
DROP POLICY IF EXISTS "Authenticated users can view menu items for orders" ON menu_items;

-- 5. Create new policies for menu_items
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

-- 6. Refresh schema cache
SELECT pg_notify('pgrst', 'reload schema');