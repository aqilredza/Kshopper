-- Allow admin (by email) to view any order in the orders table
-- Replace 'mredza31@gmail.com' with your actual admin email if different

CREATE POLICY "Admin can view any order"
ON orders
FOR SELECT
USING (
  (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.email = 'mredza31@gmail.com'
  ))
  OR user_id = auth.uid()
);

-- To apply this, run in Supabase SQL editor:
-- 1. ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- 2. Run this policy.
