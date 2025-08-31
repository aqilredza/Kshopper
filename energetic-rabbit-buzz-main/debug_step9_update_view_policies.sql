-- Step 9: Update RLS policies for the view

-- Drop existing policies on the view if they exist
DROP POLICY IF EXISTS "Users can view messages with profiles" ON custom_request_messages_with_profiles;

-- Create policy for the view
CREATE POLICY "Users can view messages with profiles" 
ON custom_request_messages_with_profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM custom_requests cr 
    WHERE cr.id = custom_request_messages_with_profiles.custom_request_id 
    AND cr.user_id = auth.uid()
  )
  OR 
  EXISTS (
    SELECT 1 FROM auth.users u 
    WHERE u.id = auth.uid() AND u.email = 'mredza31@gmail.com'
  )
);

-- Enable RLS on the view
ALTER VIEW custom_request_messages_with_profiles ENABLE ROW LEVEL SECURITY;