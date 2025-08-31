-- Fix for allowing admin to insert menu items
-- Run this script in your Supabase SQL editor

-- First, let's create a function to check if current user is admin
-- This is safer than querying auth.users directly
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $
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
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "admin_insert_menu_items" ON menu_items;

-- Create policy to allow admin to insert menu items
CREATE POLICY "admin_insert_menu_items"
ON menu_items
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin_user()
);

-- Also ensure admin can update and delete menu items
DROP POLICY IF EXISTS "admin_update_menu_items" ON menu_items;
CREATE POLICY "admin_update_menu_items"
ON menu_items
FOR UPDATE
TO authenticated
USING (
  is_admin_user()
);

DROP POLICY IF EXISTS "admin_delete_menu_items" ON menu_items;
CREATE POLICY "admin_delete_menu_items"
ON menu_items
FOR DELETE
TO authenticated
USING (
  is_admin_user()
);

-- Grant necessary permissions to the function
GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated;

-- Refresh schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- Verify policies were created
SELECT polname FROM pg_policy WHERE polrelid = 'menu_items'::regclass;