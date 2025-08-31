-- Final fix for RLS policies - simpler approach
-- Remove complex policies and use simpler ones

-- Drop all existing policies
DROP POLICY IF EXISTS "admin_full_access_order_items" ON order_items;
DROP POLICY IF EXISTS "user_access_own_order_items" ON order_items;
DROP POLICY IF EXISTS "admin_full_access_menu_items" ON menu_items;
DROP POLICY IF EXISTS "authenticated_access_menu_items" ON menu_items;

-- Create very simple policies
-- Allow all authenticated users to SELECT from order_items (we'll control access in app)
CREATE POLICY "allow_authenticated_select_order_items"
ON order_items
FOR SELECT
TO authenticated
USING (true);

-- Allow all authenticated users to SELECT from menu_items
CREATE POLICY "allow_authenticated_select_menu_items"
ON menu_items
FOR SELECT
TO authenticated
USING (true);

-- For UPDATE/INSERT/DELETE, only allow admin
CREATE POLICY "admin_manage_order_items"
ON order_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.email = 'mredza31@gmail.com'
  )
);

-- Refresh schema cache
SELECT pg_notify('pgrst', 'reload schema');