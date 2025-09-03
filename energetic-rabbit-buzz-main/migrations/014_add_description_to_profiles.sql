-- Add description column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add a site_settings table for additional configuration
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default description for admin
UPDATE profiles 
SET description = 'Hey there! 👋 I''m Redza, your new go-to style guru and personal shopper.

Tired of endless scrolling? I''m here to do the heavy lifting! I''ll handpick pieces you''ll absolutely love, spill the tea on the latest trends, and make sure your look is always on point. 🔥

Ready to unlock your best style? Let''s chat! Slide into my WhatsApp and we''ll get started.'
WHERE id = (SELECT id FROM auth.users WHERE email = 'mredza31@gmail.com')
AND (description IS NULL OR description = '');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_description ON profiles(description);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- Grant necessary permissions
GRANT ALL ON TABLE site_settings TO authenticated;