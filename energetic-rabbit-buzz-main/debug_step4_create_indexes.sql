-- Step 4: Create indexes for better query performance

CREATE INDEX idx_custom_request_messages_request_id 
ON custom_request_messages(custom_request_id);

CREATE INDEX idx_custom_request_messages_sender_id 
ON custom_request_messages(sender_id);

CREATE INDEX idx_custom_request_messages_created_at 
ON custom_request_messages(created_at);