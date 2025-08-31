-- Check and fix RLS policies for menu_items table
-- This ensures admins and users can access menu item details

-- Check existing policies on menu_items
SELECT 
  polname AS policy_name,
  polcmd AS command,
  polqual AS using_clause
FROM pg_policy
WHERE polrelid = 'menu_items'::regclass;

-- Drop existing policies
DROP POLICY IF EXISTS "admin_all_menu_items" ON menu_items;
DROP POLICY IF EXISTS "authenticated_menu_items" ON menu_items;
DROP POLICY IF EXISTS "Admin can view all menu items" ON menu_items;
DROP POLICY IF EXISTS "Public can view available menu items" ON menu_items;

-- Create new policies for menu_items
-- Admin policy - allow admin to see all menu items
CREATE POLICY "admin_view_all_menu_items"
ON menu_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid() AND u.email = 'mredza31@gmail.com'
  )
);

-- General policy - allow authenticated users to see menu items
CREATE POLICY "authenticated_view_menu_items"
ON menu_items
FOR SELECT
USING (
  auth.uid() IS NOT NULL
);

-- Refresh schema cache
SELECT pg_notify('pgrst', 'reload schema');