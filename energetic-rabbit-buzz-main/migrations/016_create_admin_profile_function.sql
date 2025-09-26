-- Add admin_title column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS admin_title TEXT;

-- Add email column to profiles table if it doesn't exist (for storing custom contact email)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create a function to safely update admin profile
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
GRANT EXECUTE ON FUNCTION update_admin_profile TO authenticated;

-- Also ensure the admin has the correct permissions
UPDATE profiles 
SET is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'mredza31@gmail.com');