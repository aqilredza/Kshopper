-- TEST SCRIPT TO IDENTIFY WHAT'S CAUSING STATUS RESET
-- Run this in your Supabase SQL Editor

-- First, let's create a test request
INSERT INTO custom_requests (user_id, product_description, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Debug test request', 'pending')
ON CONFLICT DO NOTHING;

-- Get the test request ID
SELECT id, status FROM custom_requests WHERE product_description = 'Debug test request';

-- Now let's try to update it
UPDATE custom_requests 
SET status = 'approved' 
WHERE product_description = 'Debug test request';

-- Check if it was updated
SELECT id, status FROM custom_requests WHERE product_description = 'Debug test request';

-- Wait a moment and check again (to see if something resets it)
-- SELECT pg_sleep(2);

-- Check again
SELECT id, status FROM custom_requests WHERE product_description = 'Debug test request';

-- Clean up
DELETE FROM custom_requests WHERE product_description = 'Debug test request';