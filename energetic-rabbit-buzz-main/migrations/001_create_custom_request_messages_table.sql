-- Complete setup script for custom request chat feature
-- Run this script in your Supabase SQL editor

-- Create the custom_request_messages table
CREATE TABLE IF NOT EXISTS custom_request_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  custom_request_id UUID REFERENCES custom_requests(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_custom_request_messages_request_id 
ON custom_request_messages(custom_request_id);

CREATE INDEX IF NOT EXISTS idx_custom_request_messages_sender_id 
ON custom_request_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_custom_request_messages_created_at 
ON custom_request_messages(created_at);

-- Enable RLS (Row Level Security) if it's not already enabled
DO $ 
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'custom_request_messages') THEN
    ALTER TABLE custom_request_messages ENABLE ROW LEVEL SECURITY;
  END IF;
END $;

-- Remove existing policies if they exist
DROP POLICY IF EXISTS "Users can view messages for their requests" ON custom_request_messages;
DROP POLICY IF EXISTS "Users and admins can insert messages" ON custom_request_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON custom_request_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON custom_request_messages;

-- Create policies for RLS
-- Users can view messages for their own requests
CREATE POLICY "Users can view messages for their requests" 
ON custom_request_messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM custom_requests cr 
    WHERE cr.id = custom_request_messages.custom_request_id 
    AND cr.user_id = auth.uid()
  )
  OR 
  EXISTS (
    SELECT 1 FROM auth.users u 
    WHERE u.id = auth.uid() AND u.email = 'mredza31@gmail.com'
  )
);

-- Users and admins can insert messages for requests they have access to
CREATE POLICY "Users and admins can insert messages" 
ON custom_request_messages FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM custom_requests cr 
    WHERE cr.id = custom_request_messages.custom_request_id 
    AND cr.user_id = auth.uid()
  )
  OR 
  EXISTS (
    SELECT 1 FROM auth.users u 
    WHERE u.id = auth.uid() AND u.email = 'mredza31@gmail.com'
  )
);

-- Users can update their own messages
CREATE POLICY "Users can update their own messages" 
ON custom_request_messages FOR UPDATE 
USING (sender_id = auth.uid());

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages" 
ON custom_request_messages FOR DELETE 
USING (sender_id = auth.uid());

-- Grant necessary permissions
GRANT ALL ON TABLE custom_request_messages TO authenticated;

-- Refresh the schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- Verify the table was created successfully
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'custom_request_messages'
) AS table_exists;