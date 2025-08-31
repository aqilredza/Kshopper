-- Step 11: Refresh schema cache and verify everything

-- Notify PostgREST to reload the schema
SELECT pg_notify('pgrst', 'reload schema');

-- Wait a moment and then verify our setup
SELECT 
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'custom_request_messages'
  ) AS table_exists,
  EXISTS (
    SELECT FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name = 'custom_request_messages_with_profiles'
  ) AS view_exists,
  EXISTS (
    SELECT FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'get_custom_request_messages'
  ) AS function_exists;