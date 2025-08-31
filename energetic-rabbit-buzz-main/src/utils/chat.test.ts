// Test script for chat functionality
// This script can be used to verify that the chat feature is working correctly

import { supabase } from '@/integrations/supabase/client';

// Test function to send a message
export const testSendMessage = async (customRequestId, senderId, message) => {
  try {
    const { data, error } = await supabase
      .from('custom_request_messages')
      .insert({
        custom_request_id: customRequestId,
        sender_id: senderId,
        message: message
      })
      .select();

    if (error) {
      console.error('Error sending message:', error);
      return { success: false, error };
    }

    console.log('Message sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error };
  }
};

// Test function to fetch messages
export const testFetchMessages = async (customRequestId) => {
  try {
    const { data, error } = await supabase
      .from('custom_request_messages')
      .select('*, sender_profile:profiles(full_name)')
      .eq('custom_request_id', customRequestId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return { success: false, error };
    }

    console.log('Messages fetched successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error };
  }
};

// Test function to subscribe to messages
export const testSubscribeToMessages = (customRequestId, callback) => {
  try {
    const channel = supabase
      .channel(`test-custom-request-messages-${customRequestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'custom_request_messages',
          filter: `custom_request_id=eq.${customRequestId}`
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    console.log('Subscribed to messages for request:', customRequestId);
    return channel;
  } catch (error) {
    console.error('Error subscribing to messages:', error);
    return null;
  }
};

// Example usage:
// testSendMessage('REQUEST_ID_HERE', 'USER_ID_HERE', 'Hello, this is a test message!');
// testFetchMessages('REQUEST_ID_HERE');
// testSubscribeToMessages('REQUEST_ID_HERE', (newMessage) => {
//   console.log('New message received:', newMessage);
// });