-- Cleanup script: Remove views and functions we created

-- Drop the view if it exists
DROP VIEW IF EXISTS custom_request_messages_with_profiles;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS get_custom_request_messages(UUID);

-- Refresh the schema cache
SELECT pg_notify('pgrst', 'reload schema');