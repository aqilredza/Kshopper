-- Check for any views or functions that might be causing the issue
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_definition ILIKE '%user%'
   OR routine_definition ILIKE '%auth%'
   OR routine_definition ILIKE '%permission%'
ORDER BY routine_name;

-- Check for any views
SELECT 
  table_name,
  view_definition
FROM information_schema.views
WHERE view_definition ILIKE '%user%'
   OR view_definition ILIKE '%auth%'
   OR view_definition ILIKE '%permission%'
ORDER BY table_name;