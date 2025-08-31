-- Complete fix for admin access policies that properly handles user authentication
-- This script replaces direct queries to auth.users with more secure approaches

-- First, let's create a function to check if current user is admin
-- This is safer than querying auth.users directly
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Use current_setting to get the user email from JWT claims
  -- This avoids direct queries to the protected auth.users table
  RETURN (
    current_setting('request.jwt.claims', true)::json->>'email' = 'mredza31@gmail.com'
  );
EXCEPTION 
  WHEN others THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions to the function
GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_user() TO anon;

-- Fix policies in custom_request_messages table
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can view messages for their requests" ON custom_request_messages;
  DROP POLICY IF EXISTS "Users and admins can insert messages" ON custom_request_messages;
  
  -- Create new policies using the secure function
  CREATE POLICY "Users can view messages for their requests" 
  ON custom_request_messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM custom_requests cr 
      WHERE cr.id = custom_request_messages.custom_request_id 
      AND cr.user_id = auth.uid()
    )
    OR is_admin_user()
  );

  CREATE POLICY "Users and admins can insert messages" 
  ON custom_request_messages FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM custom_requests cr 
      WHERE cr.id = custom_request_messages.custom_request_id 
      AND cr.user_id = auth.uid()
    )
    OR is_admin_user()
  );
END $$;

-- Fix policies in orders table
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Admin can view all orders" ON orders;
  DROP POLICY IF EXISTS "Admin can update any order" ON orders;
  
  -- Create new policies using the secure function
  CREATE POLICY "Admin can view all orders"
  ON orders
  FOR SELECT
  USING (
    is_admin_user()
  );

  CREATE POLICY "Admin can update any order"
  ON orders
  FOR UPDATE
  USING (
    is_admin_user() OR user_id = auth.uid()
  );
END $$;

-- Fix policies in order_items table
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "admin_all_order_items" ON order_items;
  DROP POLICY IF EXISTS "user_own_order_items" ON order_items;
  
  -- Create new policies using the secure function
  CREATE POLICY "admin_all_order_items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (
    is_admin_user()
  );

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
END $$;

-- Fix policies in menu_items table
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "admin_all_menu_items" ON menu_items;
  DROP POLICY IF EXISTS "authenticated_menu_items" ON menu_items;
  DROP POLICY IF EXISTS "Admin can view all menu items" ON menu_items;
  DROP POLICY IF EXISTS "Public can view available menu items" ON menu_items;
  DROP POLICY IF EXISTS "Authenticated users can view menu items for orders" ON menu_items;
  
  -- Create new policies using the secure function
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

  CREATE POLICY "authenticated_menu_items"
  ON menu_items
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL
  );
END $$;

-- Refresh schema cache
SELECT pg_notify('pgrst', 'reload schema');