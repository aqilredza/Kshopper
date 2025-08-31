-- Step 2: Create the custom_request_messages table
-- This table will store chat messages between users and admins about custom requests

CREATE TABLE custom_request_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  custom_request_id UUID,
  sender_id UUID,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments to describe the table and columns
COMMENT ON TABLE custom_request_messages IS 'Stores chat messages between users and admins about custom requests';
COMMENT ON COLUMN custom_request_messages.id IS 'Unique identifier for each message';
COMMENT ON COLUMN custom_request_messages.custom_request_id IS 'Reference to the custom request this message is about';
COMMENT ON COLUMN custom_request_messages.sender_id IS 'Reference to the user who sent the message';
COMMENT ON COLUMN custom_request_messages.message IS 'The content of the message';
COMMENT ON COLUMN custom_request_messages.created_at IS 'Timestamp when the message was created';