// Utility functions for handling real-time chat updates
import { supabase } from '@/integrations/supabase/client';

// Subscribe to new messages for a specific request
export const subscribeToMessages = (requestId, callback) => {
  console.log('Creating subscription for request:', requestId);
  // Use a more specific channel name to avoid conflicts
  const channel = supabase
    .channel(`custom_request_messages_${requestId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'custom_request_messages',
        filter: `custom_request_id=eq.${requestId}`
      },
      (payload) => {
        console.log('Received message via subscribeToMessages:', payload.new);
        try {
          callback(payload.new);
        } catch (error) {
          console.error('Error in message callback:', error);
        }
      }
    )
    .subscribe((status, error) => {
      console.log('Subscription status for request', requestId, ':', status);
      if (error) {
        console.error('Subscription error for request', requestId, ':', error);
      }
      // Log when subscription is established
      if (status === 'SUBSCRIBED') {
        console.log('Real-time subscription established for request:', requestId);
      }
    });

  return channel;
};

// Unsubscribe from messages
export const unsubscribeFromMessages = (channel) => {
  console.log('Unsubscribing from channel');
  if (channel) {
    supabase.removeChannel(channel);
  }
};

// Format timestamp for display
export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};