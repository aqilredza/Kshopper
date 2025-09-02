import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface ChatNotification {
  id: string;
  custom_request_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  request_title?: string;
  sender_name?: string;
  read?: boolean;
}

interface NotificationContextType {
  unreadCount: number;
  notifications: ChatNotification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  resetUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const subscriptionRef = useRef<any>(null);
  const ADMIN_EMAIL = "mredza31@gmail.com";

  // Load initial notifications
  useEffect(() => {
    if (!session) {
      setUnreadCount(0);
      setNotifications([]);
      setLoaded(false);
      return;
    }

    const loadInitialNotifications = async () => {
      try {
        // For admins, get all unread messages from requests they have access to
        if (session.user.email === ADMIN_EMAIL) {
          const { data, error } = await supabase
            .from('custom_request_messages')
            .select(`
              id,
              custom_request_id,
              sender_id,
              message,
              created_at,
              custom_requests(product_description),
              profiles(full_name)
            `)
            .order('created_at', { ascending: false })
            .limit(20);

          if (!error && data) {
            const processedNotifications = data.map(msg => ({
              id: msg.id,
              custom_request_id: msg.custom_request_id,
              sender_id: msg.sender_id,
              message: msg.message,
              created_at: msg.created_at,
              request_title: msg.custom_requests?.product_description || 'Untitled Request',
              sender_name: msg.profiles?.full_name || 'User'
            }));

            setNotifications(processedNotifications);
            
            // Count unread messages (for now, all are considered unread until marked)
            setUnreadCount(processedNotifications.length);
          }
        } else {
          // For regular users, get messages for their requests
          const { data, error } = await supabase
            .from('custom_request_messages')
            .select(`
              id,
              custom_request_id,
              sender_id,
              message,
              created_at,
              custom_requests(product_description),
              profiles(full_name)
            `)
            .eq('custom_requests.user_id', session.user.id)
            .neq('sender_id', session.user.id) // Don't notify about own messages
            .order('created_at', { ascending: false })
            .limit(20);

          if (!error && data) {
            const processedNotifications = data.map(msg => ({
              id: msg.id,
              custom_request_id: msg.custom_request_id,
              sender_id: msg.sender_id,
              message: msg.message,
              created_at: msg.created_at,
              request_title: msg.custom_requests?.product_description || 'Untitled Request',
              sender_name: msg.profiles?.full_name || 'Admin'
            }));

            setNotifications(processedNotifications);
            
            // Count unread messages (for now, all are considered unread until marked)
            setUnreadCount(processedNotifications.length);
          }
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoaded(true);
      }
    };

    loadInitialNotifications();
  }, [session]);

  // Set up real-time subscription
  useEffect(() => {
    if (!session || !loaded) return;

    // Clean up existing subscription
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    // Create new subscription
    const channel = supabase
      .channel('custom_request_messages_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'custom_request_messages'
        },
        async (payload) => {
          const newMessage = payload.new as any;
          
          // For admins, notify about all new messages
          if (session.user.email === ADMIN_EMAIL) {
            // Fetch additional info for the notification
            const { data: requestInfo } = await supabase
              .from('custom_requests')
              .select('product_description')
              .eq('id', newMessage.custom_request_id)
              .single();
              
            const { data: senderInfo } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', newMessage.sender_id)
              .single();
            
            const notification: ChatNotification = {
              id: newMessage.id,
              custom_request_id: newMessage.custom_request_id,
              sender_id: newMessage.sender_id,
              message: newMessage.message,
              created_at: newMessage.created_at,
              request_title: requestInfo?.product_description || 'Untitled Request',
              sender_name: senderInfo?.full_name || 'User'
            };
            
            setNotifications(prev => [notification, ...prev].slice(0, 20));
            setUnreadCount(prev => prev + 1);
          } 
          // For regular users, only notify about messages from admins
          else if (newMessage.sender_id !== session.user.id) {
            // Check if this message is for a request owned by the current user
            const { data: requestCheck } = await supabase
              .from('custom_requests')
              .select('id')
              .eq('id', newMessage.custom_request_id)
              .eq('user_id', session.user.id)
              .single();
              
            if (requestCheck) {
              // Fetch additional info for the notification
              const { data: requestInfo } = await supabase
                .from('custom_requests')
                .select('product_description')
                .eq('id', newMessage.custom_request_id)
                .single();
                
              const { data: senderInfo } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', newMessage.sender_id)
                .single();
              
              const notification: ChatNotification = {
                id: newMessage.id,
                custom_request_id: newMessage.custom_request_id,
                sender_id: newMessage.sender_id,
                message: newMessage.message,
                created_at: newMessage.created_at,
                request_title: requestInfo?.product_description || 'Untitled Request',
                sender_name: senderInfo?.full_name || 'Admin'
              };
              
              setNotifications(prev => [notification, ...prev].slice(0, 20));
              setUnreadCount(prev => prev + 1);
            }
          }
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    // Clean up subscription on unmount
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [session, loaded]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{
      unreadCount,
      notifications,
      markAsRead,
      markAllAsRead,
      resetUnreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};