-- Step 8: Create a view that joins messages with sender profiles

-- First, drop the view if it exists
DROP VIEW IF EXISTS custom_request_messages_with_profiles;

-- Create a view that includes sender profile information
CREATE VIEW custom_request_messages_with_profiles AS
SELECT 
  m.id,
  m.custom_request_id,
  m.sender_id,
  m.message,
  m.created_at,
  p.full_name as sender_name,
  p.avatar_url as sender_avatar
FROM custom_request_messages m
LEFT JOIN profiles p ON m.sender_id = p.id;

-- Grant access to the view
GRANT ALL ON custom_request_messages_with_profiles TO authenticated;