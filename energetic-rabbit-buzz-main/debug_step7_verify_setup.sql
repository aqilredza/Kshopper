-- Step 7: Verify the setup

-- Check if the table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'custom_request_messages'
) AS table_exists;

-- Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'custom_request_messages'
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT 
  relname AS table_name,
  relrowsecurity AS rls_enabled
FROM pg_class 
WHERE relname = 'custom_request_messages';

-- Check policies
SELECT 
  polname AS policy_name,
  polcmd AS command,
  polqual AS using_clause,
  polwithcheck AS with_check_clause
FROM pg_policy
WHERE polrelid = 'custom_request_messages'::regclass;

-- Test insert (this should work if everything is set up correctly)
-- Note: Replace the UUIDs with actual values from your database
INSERT INTO custom_request_messages (custom_request_id, sender_id, message)
VALUES (
  (SELECT id FROM custom_requests LIMIT 1),  -- Get a real request ID
  (SELECT id FROM auth.users LIMIT 1),       -- Get a real user ID
  'Test message to verify setup'
)
ON CONFLICT DO NOTHING;

-- Check if the test message was inserted
SELECT COUNT(*) as message_count FROM custom_request_messages;

-- Clean up the test message
DELETE FROM custom_request_messages 
WHERE message = 'Test message to verify setup';