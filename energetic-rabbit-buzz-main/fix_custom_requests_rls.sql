-- FIX RLS POLICIES FOR CUSTOM_REQUESTS TABLE
-- Run this in your Supabase SQL Editor

-- First, check if the table exists and RLS status
SELECT 
  relname AS table_name,
  relrowsecurity AS rls_enabled
FROM pg_class 
WHERE relname = 'custom_requests';

-- Enable RLS on custom_requests if not already enabled
DO $$ 
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'custom_requests') THEN
    ALTER TABLE custom_requests ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS enabled on custom_requests';
  ELSE
    RAISE NOTICE 'RLS already enabled on custom_requests';
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own requests" ON custom_requests;
DROP POLICY IF EXISTS "Users can insert their own requests" ON custom_requests;
DROP POLICY IF EXISTS "Users can update their own requests" ON custom_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON custom_requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON custom_requests;

-- Create policies for custom_requests
-- Users can view their own requests
CREATE POLICY "Users can view their own requests" 
ON custom_requests FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all requests" 
ON custom_requests FOR SELECT 
USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'mredza31@gmail.com'));

-- Users can insert their own requests
CREATE POLICY "Users can insert their own requests" 
ON custom_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own requests
CREATE POLICY "Users can update their own requests" 
ON custom_requests FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins can update all requests
CREATE POLICY "Admins can update all requests" 
ON custom_requests FOR UPDATE 
USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'mredza31@gmail.com'));

-- Grant necessary permissions
GRANT ALL ON TABLE custom_requests TO authenticated;

-- Refresh the schema
SELECT pg_notify('pgrst', 'reload schema');

-- Verify the policies were created
SELECT 
  polname AS policy_name,
  polcmd AS command_type
FROM pg_policy
WHERE polrelid = 'custom_requests'::regclass
ORDER BY polname;