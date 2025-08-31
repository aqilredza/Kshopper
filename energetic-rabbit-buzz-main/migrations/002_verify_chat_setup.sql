-- Final verification script for chat functionality
-- Run this after setting up the chat table to verify everything is working

-- 1. Check if the table exists and has the correct structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'custom_request_messages'
ORDER BY ordinal_position;

-- 2. Check if RLS is enabled
SELECT 
  relname as table_name,
  relrowsecurity as rls_enabled,
  relforcerowsecurity as force_rls
FROM pg_class 
WHERE relname = 'custom_request_messages';

-- 3. Check policies
SELECT 
  polname as policy_name,
  polcmd as command,
  polqual as using_clause,
  polwithcheck as with_check_clause
FROM pg_policy
WHERE polrelid = 'custom_request_messages'::regclass;

-- 4. Test a simple select (this will show if RLS allows access)
SELECT COUNT(*) as message_count FROM custom_request_messages;

-- 5. Check if the admin user exists
SELECT id, email FROM auth.users WHERE email = 'mredza31@gmail.com';