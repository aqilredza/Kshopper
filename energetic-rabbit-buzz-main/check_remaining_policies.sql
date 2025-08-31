-- Check what policies still exist
SELECT 
  cls.relname as table_name,
  pol.polname as policy_name,
  pol.polcmd as command,
  pol.polqual as using_clause
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE cls.relname IN ('orders', 'order_items', 'menu_items')
ORDER BY cls.relname, pol.polname;

-- Check if there are any policies on other tables that might be causing issues
SELECT 
  cls.relname as table_name,
  pol.polname as policy_name,
  pol.polcmd as command,
  pol.polqual as using_clause
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE pol.polqual ILIKE '%user%'
   OR pol.polqual ILIKE '%auth%'
ORDER BY cls.relname, pol.polname;