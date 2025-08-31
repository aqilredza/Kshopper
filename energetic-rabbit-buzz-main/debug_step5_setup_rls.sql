-- Step 5: Enable Row Level Security (RLS) and set up policies

-- Enable RLS
ALTER TABLE custom_request_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for accessing messages
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