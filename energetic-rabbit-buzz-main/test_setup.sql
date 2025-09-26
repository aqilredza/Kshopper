-- This is the updated complete_setup.sql in a format that can be run directly
-- Complete setup script for platforms and menu_items
-- Run this script in your Supabase SQL editor to create the required records

-- Step 1: Create a default platform
INSERT INTO platforms (name) VALUES ('KShopper Platform')
ON CONFLICT DO NOTHING;

-- Step 2: Create a table to store general about page content
CREATE TABLE IF NOT EXISTS about_content (
  id SERIAL PRIMARY KEY,
  title TEXT DEFAULT 'About KShopper',
  description TEXT DEFAULT 'KShopper is your trusted bridge to authentic Korean products. We connect Malaysian customers with verified personal shoppers in Korea to source authentic K-beauty, fashion, snacks, and lifestyle products.',
  mission TEXT DEFAULT 'Our mission is to make Korean products accessible to everyone in Malaysia while ensuring authenticity and quality. Whether you are looking for the latest K-beauty trends, exclusive fashion pieces, or unique snacks, we have got you covered.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the about_content table
DO $ 
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'about_content') THEN
    ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
  END IF;
END $;

-- Insert default content if none exists
INSERT INTO about_content (title, description, mission)
SELECT 
  'About KShopper',
  'KShopper is your trusted bridge to authentic Korean products. We connect Malaysian customers with verified personal shoppers in Korea to source authentic K-beauty, fashion, snacks, and lifestyle products.',
  'Our mission is to make Korean products accessible to everyone in Malaysia while ensuring authenticity and quality. Whether you''re looking for the latest K-beauty trends, exclusive fashion pieces, or unique snacks, we''ve got you covered.'
WHERE NOT EXISTS (SELECT 1 FROM about_content);

-- Create a function to update about content
CREATE OR REPLACE FUNCTION update_about_content(
  p_title TEXT,
  p_description TEXT,
  p_mission TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Check if the current user is admin
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    -- Update the existing content (assuming only one record for now)
    UPDATE about_content 
    SET 
      title = p_title,
      description = p_description,
      mission = p_mission,
      updated_at = NOW()
    WHERE id = 1;
    
    -- If no record was updated, create one
    IF NOT FOUND THEN
      INSERT INTO about_content (title, description, mission) 
      VALUES (p_title, p_description, p_mission);
    END IF;
  ELSE
    RAISE EXCEPTION 'Permission denied: Only admin can update about content';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_about_content TO authenticated;

-- Create policies for RLS
-- Allow admins to select about content
CREATE POLICY "Admin can view about content" 
ON about_content FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.is_admin = true
  )
);

-- Allow admins to update about content
CREATE POLICY "Admin can update about content" 
ON about_content FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.is_admin = true
  )
);

-- Grant necessary permissions
GRANT ALL ON TABLE about_content TO authenticated;

-- Step 3: Verify the setup
SELECT 
    p.id as platform_id,
    p.name as platform_name
FROM platforms p
LIMIT 5;

-- Verify about_content table
SELECT 
    ac.id,
    ac.title,
    ac.description,
    ac.mission
FROM about_content ac
LIMIT 5;