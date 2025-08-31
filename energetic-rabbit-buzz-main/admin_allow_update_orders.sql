-- Allow admin (by email) to update any order in the orders table
-- Replace 'mredza31@gmail.com' with your actual admin email if different

CREATE POLICY "Admin can update any order"
ON orders
FOR UPDATE
USING (
  (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.email = 'mredza31@gmail.com'
  ))
  OR user_id = auth.uid()
);
