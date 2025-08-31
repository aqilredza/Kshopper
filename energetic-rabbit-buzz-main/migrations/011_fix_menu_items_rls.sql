-- Check and fix RLS policies for menu_items table
-- This ensures admins can access all menu items needed for order details

-- First, check if RLS is enabled on menu_items
DO $$ 
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'menu_items') THEN
    ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can view all menu items" ON menu_items;
DROP POLICY IF EXISTS "Public can view available menu items" ON menu_items;

-- Create policy to allow admin to view all menu items
CREATE POLICY "Admin can view all menu items"
ON menu_items
FOR SELECT
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'mredza31@gmail.com'
);

-- Create policy to allow public access to available menu items
CREATE POLICY "Public can view available menu items"
ON menu_items
FOR SELECT
USING (
  is_available = true
);

-- Ensure authenticated users can access menu items (for order details)
CREATE POLICY "Authenticated users can view menu items for orders"
ON menu_items
FOR SELECT
USING (
  auth.uid() IS NOT NULL
);