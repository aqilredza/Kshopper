-- Enable RLS on orders table if not already enabled
-- This script ensures that RLS is enabled on the orders table so that our policies work correctly

-- Check if RLS is already enabled
DO $$ 
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'orders') THEN
    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;