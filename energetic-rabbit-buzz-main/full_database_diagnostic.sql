-- DATABASE DIAGNOSTIC SCRIPT
-- Run this in your Supabase SQL Editor

-- 1. Check if custom_requests table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'custom_requests'
) AS custom_requests_table_exists;

-- 2. Check table structure
\d custom_requests

-- 3. Check if RLS is enabled on custom_requests
SELECT 
  relname AS table_name,
  relrowsecurity AS rls_enabled
FROM pg_class 
WHERE relname = 'custom_requests';

-- 4. Check for any policies on custom_requests
SELECT 
  polname AS policy_name,
  polcmd AS command_type,
  polqual AS using_clause,
  polwithcheck AS with_check_clause
FROM pg_policy
WHERE polrelid = 'custom_requests'::regclass;

-- 5. Check for triggers on custom_requests
SELECT 
  tgname as trigger_name,
  tgfoid::regproc as function_name,
  tgtype as trigger_type
FROM pg_trigger
WHERE tgrelid = 'custom_requests'::regclass;

-- 6. Check for any functions that might affect custom_requests
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc
WHERE prosrc ILIKE '%custom_requests%'
ORDER BY proname;

-- 7. Check for any functions that might reset status
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc
WHERE prosrc ILIKE '%status%'
  AND (prosrc ILIKE '%custom_requests%' OR prosrc ILIKE '%UPDATE%')
ORDER BY proname;

-- 8. Check for any event triggers
SELECT 
  evtname as event_trigger_name,
  evtevent as event_type,
  evtfoid::regproc as function_name
FROM pg_event_trigger;

-- 9. Let's try to create a test record and see what happens
-- First, check if we can insert a test record
INSERT INTO custom_requests (user_id, product_description, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Test request for debugging', 'pending')
ON CONFLICT DO NOTHING;

-- 10. Check what we just inserted
SELECT id, user_id, product_description, status, created_at
FROM custom_requests 
WHERE product_description = 'Test request for debugging'
ORDER BY created_at DESC
LIMIT 1;

-- 11. Try to update the status
UPDATE custom_requests 
SET status = 'approved' 
WHERE product_description = 'Test request for debugging';

-- 12. Check if the update was applied
SELECT id, status
FROM custom_requests 
WHERE product_description = 'Test request for debugging';

-- 13. Clean up test record
DELETE FROM custom_requests 
WHERE product_description = 'Test request for debugging';