-- Setup script for restaurant platforms
-- Run this script in your Supabase SQL editor to create a default restaurant platform

-- Create a default restaurant platform that all menu items can reference
INSERT INTO restaurant_platforms DEFAULT VALUES;

-- Verify the restaurant platform was created
SELECT * FROM restaurant_platforms LIMIT 5;

-- Optional: If you want to add more specific information to the restaurant platform, you can update it
-- UPDATE restaurant_platforms 
-- SET name = 'KShopper Platform', description = 'Main platform for KShopper products'
-- WHERE name IS NULL;