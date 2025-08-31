
-- Complete setup script for platforms and menu_items
-- Run this script in your Supabase SQL editor to create the required records


-- Step 1: Create a default platform
INSERT INTO platforms (name) VALUES ('KShopper Platform')
ON CONFLICT DO NOTHING;

-- Step 2: Verify the setup
SELECT 
    p.id as platform_id,
    p.name as platform_name
FROM platforms p
LIMIT 5;