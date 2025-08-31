-- Check what RPC functions exist
SELECT 
  proname as function_name,
  pronargs as argument_count,
  proargnames as argument_names,
  prosecdef as is_security_definer
FROM pg_proc
WHERE prokind = 'f' 
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;