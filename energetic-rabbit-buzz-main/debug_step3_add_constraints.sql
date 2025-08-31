-- Step 3: Add foreign key constraints to the custom_request_messages table

-- Add foreign key constraint to custom_requests
ALTER TABLE custom_request_messages 
ADD CONSTRAINT fk_custom_request_messages_request_id 
FOREIGN KEY (custom_request_id) REFERENCES custom_requests(id) ON DELETE CASCADE;

-- Add foreign key constraint to auth.users (this might need special handling in Supabase)
-- First let's check if we can add it directly:
ALTER TABLE custom_request_messages 
ADD CONSTRAINT fk_custom_request_messages_sender_id 
FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;