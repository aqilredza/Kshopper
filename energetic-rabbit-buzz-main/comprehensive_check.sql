-- Comprehensive check of all tables and their RLS status
SELECT 
  tablename,
  relrowsecurity as rls_enabled,
  relhaspkey as has_primary_key
FROM pg_tables t
JOIN pg_class c ON t.tablename = c.relname
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check if there are any policies on auth schema
SELECT 
  n.nspname as schema_name,
  cls.relname as table_name,
  pol.polname as policy_name
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
JOIN pg_namespace n ON cls.relnamespace = n.oid
WHERE n.nspname IN ('auth', 'public')
ORDER BY schema_name, table_name, policy_name;