// Utility functions for handling real-time chat updates
import { supabase } from '@/integrations/supabase/client';

// Subscribe to new messages for a specific request
export const subscribeToMessages = (requestId, callback) => {
  const channel = supabase
    .channel(`custom-request-messages-${requestId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'custom_request_messages',
        filter: `custom_request_id=eq.${requestId}`
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return channel;
};

// Unsubscribe from messages
export const unsubscribeFromMessages = (channel) => {
  supabase.removeChannel(channel);
};

// Format timestamp for display
export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};