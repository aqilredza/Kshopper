-- Generic setup script for restaurant platforms
-- This script will work with whatever columns exist in your tables

-- Try to insert a minimal restaurant record
INSERT INTO restaurants DEFAULT VALUES;

-- Now create a restaurant_platform that references the restaurant
-- Use a DO block to handle the logic
DO $$ 
DECLARE 
    rest_id UUID;
BEGIN
    -- Try to get an existing restaurant
    SELECT id INTO rest_id FROM restaurants LIMIT 1;
    
    -- If we found a restaurant, create a platform for it
    IF rest_id IS NOT NULL THEN
        -- Create a restaurant platform referencing the restaurant
        INSERT INTO restaurant_platforms (restaurant_id) 
        VALUES (rest_id);
    END IF;
END $$;

-- Verify the setup
SELECT 
    r.id as restaurant_id,
    rp.id as platform_id,
    rp.restaurant_id as platform_restaurant_id
FROM restaurants r
LEFT JOIN restaurant_platforms rp ON r.id = rp.restaurant_id
LIMIT 5;