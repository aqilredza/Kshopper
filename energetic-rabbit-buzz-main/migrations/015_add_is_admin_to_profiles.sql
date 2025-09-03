-- Add isAdmin column to profiles table to identify admin user
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Set the admin user as admin
UPDATE profiles 
SET is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'mredza31@gmail.com');

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- Update the description column if it exists
UPDATE profiles 
SET description = 'Hey there! 👋 I''m Redza, your new go-to style guru and personal shopper.

Tired of endless scrolling? I''m here to do the heavy lifting! I''ll handpick pieces you''ll absolutely love, spill the tea on the latest trends, and make sure your look is always on point. 🔥

Ready to unlock your best style? Let''s chat! Slide into my WhatsApp and we''ll get started.'
WHERE id = (SELECT id FROM auth.users WHERE email = 'mredza31@gmail.com')
AND (description IS NULL OR description = '');