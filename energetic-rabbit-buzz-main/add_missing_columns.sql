-- Add the missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS admin_title TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update the update_admin_profile function to include the new parameters
CREATE OR REPLACE FUNCTION update_admin_profile(
  p_full_name TEXT,
  p_avatar_url TEXT,
  p_description TEXT,
  p_admin_title TEXT
)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update about content (if not exists)
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_admin_profile TO authenticated;
GRANT EXECUTE ON FUNCTION update_about_content TO authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';