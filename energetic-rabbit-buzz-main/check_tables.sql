-- Check what tables actually exist
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check if there's a users table
SELECT tablename
FROM pg_tables
WHERE schemaname = 'auth' AND tablename = 'users';

-- Check what's in the auth schema
SELECT tablename
FROM pg_tables
WHERE schemaname = 'auth'
ORDER BY tablename;