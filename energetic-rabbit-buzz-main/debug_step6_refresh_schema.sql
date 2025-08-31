-- Step 6: Refresh the schema cache

-- Notify PostgREST to reload the schema
SELECT pg_notify('pgrst', 'reload schema');

-- Wait a moment and then verify the table was created
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'custom_request_messages'
) AS custom_request_messages_exists;