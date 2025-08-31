-- Check all policies that reference 'users' table
SELECT 
  n.nspname as schema_name,
  cls.relname as table_name,
  pol.polname as policy_name,
  pol.polqual as policy_condition
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
JOIN pg_namespace n ON cls.relnamespace = n.oid
WHERE pol.polqual ILIKE '%users%'
   OR pol.polwithcheck ILIKE '%users%'
ORDER BY schema_name, table_name, policy_name;