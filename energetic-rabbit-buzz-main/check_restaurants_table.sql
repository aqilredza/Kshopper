-- Let's check what columns exist in the restaurants table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'restaurants'
ORDER BY ordinal_position;