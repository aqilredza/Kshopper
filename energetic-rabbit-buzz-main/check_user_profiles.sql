-- Check profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if there's a trigger on the auth.users table
SELECT 
    tgname AS trigger_name,
    tgfoid::regproc AS function_name
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass;

-- Check for any functions related to user creation
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc
WHERE prosrc ILIKE '%profiles%'
   OR prosrc ILIKE '%handle_new_user%'
ORDER BY proname;