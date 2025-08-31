-- Allow admin (by email) to view all orders in the orders table
-- Using a simpler approach that works with Supabase RLS

-- First, check if the policy already exists and drop it if it does
DROP POLICY IF EXISTS "Admin can view all orders" ON orders;

-- Create policy to allow admin to view all orders
-- We'll use the raw email check directly
CREATE POLICY "Admin can view all orders"
ON orders
FOR SELECT
USING (
  -- Direct check for admin email
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'mredza31@gmail.com'
);

-- Also ensure the existing update policy is correctly set up
DROP POLICY IF EXISTS "Admin can update any order" ON orders;

CREATE POLICY "Admin can update any order"
ON orders
FOR UPDATE
USING (
  -- Direct check for admin email
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'mredza31@gmail.com'
  OR user_id = auth.uid()
);