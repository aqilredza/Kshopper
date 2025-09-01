-- CHECK TABLE STRUCTURE AND CONSTRAINTS
-- Run this in your Supabase SQL Editor

-- Check the structure of custom_requests table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'custom_requests'
ORDER BY ordinal_position;

-- Check for any constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'custom_requests'
ORDER BY tc.constraint_name;

-- Check for any check constraints
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE contype = 'c' 
AND conrelid = 'custom_requests'::regclass;

-- Check for any triggers
SELECT 
    tgname AS trigger_name,
    tgfoid::regproc AS function_name,
    tgtype AS trigger_type
FROM pg_trigger
WHERE tgrelid = 'custom_requests'::regclass;