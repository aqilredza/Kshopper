-- Add admin_title column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS admin_title TEXT;

-- Create a table to store general about page content
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
RETURNS VOID AS $
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
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update admin profile with title
CREATE OR REPLACE FUNCTION update_admin_profile(
  p_full_name TEXT,
  p_avatar_url TEXT,
  p_description TEXT,
  p_admin_title TEXT
)
RETURNS VOID AS $
BEGIN
  -- Check if the current user is admin
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    -- Update the admin's profile
    UPDATE profiles 
    SET 
      full_name = p_full_name,
      avatar_url = p_avatar_url,
      description = p_description,
      admin_title = p_admin_title,
      is_admin = true
    WHERE id = auth.uid();
  ELSE
    RAISE EXCEPTION 'Permission denied: Only admin can update profile';
  END IF;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_about_content TO authenticated;
GRANT EXECUTE ON FUNCTION update_admin_profile TO authenticated;

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