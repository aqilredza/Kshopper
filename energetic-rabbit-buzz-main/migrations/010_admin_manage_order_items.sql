-- Allow admin to view all order items with menu item details
-- This policy ensures admins can see order items from all users

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can view all order items" ON order_items;
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;

-- Create policy to allow admin to view all order items
CREATE POLICY "Admin can view all order items"
ON order_items
FOR SELECT
USING (
  -- Check if current user is the admin
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'mredza31@gmail.com'
);

-- Create policy to allow users to view their own order items
CREATE POLICY "Users can view their own order items"
ON order_items
FOR SELECT
USING (
  -- Check if the order belongs to the current user
  EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.id = order_items.order_id 
    AND o.user_id = auth.uid()
  )
);

-- Also ensure admin can insert/update/delete order items (for completeness)
CREATE POLICY "Admin can manage all order items"
ON order_items
FOR ALL
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'mredza31@gmail.com'
);