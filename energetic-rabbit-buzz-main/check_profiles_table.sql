-- Check if profiles table exists and its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if there's a trigger that creates profiles
SELECT 
    tgname AS trigger_name,
    tgfoid::regproc AS function_name
FROM pg_trigger
WHERE tgname ILIKE '%profile%';

-- Check for any functions related to profiles
SELECT 
    proname as function_name
FROM pg_proc
WHERE prosrc ILIKE '%profile%'
ORDER BY proname;