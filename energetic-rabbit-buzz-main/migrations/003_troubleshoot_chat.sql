-- Troubleshooting script for chat functionality
-- Run this script in your Supabase SQL editor to diagnose issues

-- 1. Check if custom_requests table exists (required for foreign key)
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'custom_requests'
) AS custom_requests_table_exists;

-- 2. Check if custom_request_messages table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'custom_request_messages'
) AS custom_request_messages_table_exists;

-- 3. If custom_requests doesn't exist, check what tables do exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%request%'
ORDER BY table_name;

-- 4. Check if the admin user exists
SELECT id, email 
FROM auth.users 
WHERE email = 'mredza31@gmail.com';

-- 5. If tables exist, check their structure
\d custom_requests
\d custom_request_messages

-- 6. Check RLS status
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname IN ('custom_requests', 'custom_request_messages');

-- 7. Check policies
SELECT polname, polrelid::regclass as table_name
FROM pg_policy
WHERE polrelid::regclass::text IN ('custom_requests', 'custom_request_messages');