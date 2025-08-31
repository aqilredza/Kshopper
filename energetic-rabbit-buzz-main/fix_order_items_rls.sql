-- Fix RLS policies for order_items table
-- This will allow admins to see all order items and users to see their own

-- First, check existing policies
SELECT 
  polname AS policy_name,
  polcmd AS command,
  polqual AS using_clause
FROM pg_policy
WHERE polrelid = 'order_items'::regclass;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "admin_all_order_items" ON order_items;
DROP POLICY IF EXISTS "user_own_order_items" ON order_items;
DROP POLICY IF EXISTS "Admin can view all order items" ON order_items;
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;

-- Create new policies
-- Admin policy - allow admin to see all order items
CREATE POLICY "admin_view_all_order_items"
ON order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid() AND u.email = 'mredza31@gmail.com'
  )
);

-- User policy - allow users to see their own order items
CREATE POLICY "user_view_own_order_items"
ON order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.id = order_items.order_id 
    AND o.user_id = auth.uid()
  )
);

-- Refresh schema cache
SELECT pg_notify('pgrst', 'reload schema');