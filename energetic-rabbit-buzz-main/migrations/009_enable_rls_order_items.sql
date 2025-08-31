-- Enable RLS on order_items table if not already enabled
-- This script ensures that RLS is enabled on the order_items table so that our policies work correctly

-- Check if RLS is already enabled
DO $$ 
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'order_items') THEN
    ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;