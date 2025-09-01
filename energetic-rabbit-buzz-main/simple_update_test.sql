-- SIMPLE STATUS UPDATE TEST
-- Run this in your Supabase SQL Editor

-- 1. Check if there are any records
SELECT COUNT(*) as total_requests FROM custom_requests;

-- 2. Get a sample record
SELECT id, status FROM custom_requests LIMIT 1;

-- 3. If there are records, try to update the first one
UPDATE custom_requests 
SET status = 'testing_direct_update' 
WHERE id = (SELECT id FROM custom_requests LIMIT 1);

-- 4. Check if the update was applied
SELECT id, status FROM custom_requests 
WHERE status = 'testing_direct_update';

-- 5. Reset the status back to original (you might need to adjust this)
UPDATE custom_requests 
SET status = 'pending' 
WHERE status = 'testing_direct_update';