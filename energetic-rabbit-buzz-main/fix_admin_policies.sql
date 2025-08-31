-- Fix for admin access policies that properly handle user authentication
-- This script replaces direct queries to auth.users with more secure approaches

-- First, let's create a function to check if current user is admin
-- This is safer than querying auth.users directly
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 
      FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'mredza31@gmail.com'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
DROP POLICY IF EXISTS "admin_all_order_items" ON order_items;
DROP POLICY IF EXISTS "user_own_order_items" ON order_items;

-- 3. Create new policies for order_items
-- Admin policy - allow admin to see all order items
CREATE POLICY "admin_all_order_items"
ON order_items
FOR ALL
TO authenticated
USING (
  is_admin_user()
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
DROP POLICY IF EXISTS "admin_all_menu_items" ON menu_items;
DROP POLICY IF EXISTS "authenticated_menu_items" ON menu_items;

-- 5. Create new policies for menu_items
-- Admin policy - allow admin to insert/update/delete menu items
CREATE POLICY "admin_all_menu_items"
ON menu_items
FOR ALL
TO authenticated
USING (
  is_admin_user()
)
WITH CHECK (
  is_admin_user()
);

-- General policy - allow authenticated users to see menu items
CREATE POLICY "authenticated_menu_items"
ON menu_items
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
);

-- 6. Grant necessary permissions to the function
GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated;

-- 7. Refresh schema cache
SELECT pg_notify('pgrst', 'reload schema');