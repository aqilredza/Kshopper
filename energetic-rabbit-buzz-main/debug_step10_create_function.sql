-- Step 10: Create a function to get messages with sender profiles

-- Drop the function if it exists
DROP FUNCTION IF EXISTS get_custom_request_messages(UUID);

-- Create a function that returns messages with sender profile information
CREATE OR REPLACE FUNCTION get_custom_request_messages(request_id UUID)
RETURNS TABLE (
  id UUID,
  custom_request_id UUID,
  sender_id UUID,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  sender_profile JSON
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.custom_request_id,
    m.sender_id,
    m.message,
    m.created_at,
    row_to_json(p.*) as sender_profile
  FROM custom_request_messages m
  LEFT JOIN profiles p ON m.sender_id = p.id
  WHERE m.custom_request_id = request_id
  ORDER BY m.created_at ASC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_custom_request_messages(UUID) TO authenticated;