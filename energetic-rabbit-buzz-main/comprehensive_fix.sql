-- COMPREHENSIVE FIX FOR CUSTOM REQUESTS STATUS ISSUE
-- Run this in your Supabase SQL Editor

-- 1. First, check the current state
SELECT 
  relname AS table_name,
  relrowsecurity AS rls_enabled
FROM pg_class 
WHERE relname = 'custom_requests';

-- 2. Check existing policies
SELECT 
  polname AS policy_name,
  polcmd AS command_type
FROM pg_policy
WHERE polrelid = 'custom_requests'::regclass;

-- 3. Check for triggers
SELECT 
  tgname AS trigger_name,
  tgfoid::regproc AS function_name
FROM pg_trigger
WHERE tgrelid = 'custom_requests'::regclass;

-- 4. Enable RLS if not enabled
DO $$ 
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'custom_requests') THEN
    ALTER TABLE custom_requests ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS enabled on custom_requests';
  ELSE
    RAISE NOTICE 'RLS already enabled on custom_requests';
  END IF;
END $$;

-- 5. Drop all existing policies on custom_requests
DROP POLICY IF EXISTS "Users can view their own requests" ON custom_requests;
DROP POLICY IF EXISTS "Users can insert their own requests" ON custom_requests;
DROP POLICY IF EXISTS "Users can update their own requests" ON custom_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON custom_requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON custom_requests;
DROP POLICY IF EXISTS "Allow authenticated users to select" ON custom_requests;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON custom_requests;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON custom_requests;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON custom_requests;

-- 6. Create comprehensive policies
-- Users can view their own requests
CREATE POLICY "Users can view their own requests" 
ON custom_requests FOR SELECT 
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'mredza31@gmail.com'));

-- Users can insert their own requests
CREATE POLICY "Users can insert their own requests" 
ON custom_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own requests or admins can update all
CREATE POLICY "Users and admins can update requests" 
ON custom_requests FOR UPDATE 
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'mredza31@gmail.com'));

-- Admins can delete requests
CREATE POLICY "Admins can delete requests" 
ON custom_requests FOR DELETE 
USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'mredza31@gmail.com'));

-- 7. Grant necessary permissions
GRANT ALL ON TABLE custom_requests TO authenticated;

-- 8. Check for any functions that might be causing issues
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc
WHERE prosrc ILIKE '%custom_requests%' 
  AND (prosrc ILIKE '%UPDATE%' OR prosrc ILIKE '%status%')
ORDER BY proname;

-- 9. Refresh the schema
SELECT pg_notify('pgrst', 'reload schema');

-- 10. Verify the policies were created
SELECT 
  polname AS policy_name,
  polcmd AS command_type
FROM pg_policy
WHERE polrelid = 'custom_requests'::regclass
ORDER BY polname;

RAISE NOTICE 'Custom requests RLS policies have been updated. Please test the status update functionality.';