import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft, ExternalLink, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { showError, showSuccess } from '@/utils/toast';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { subscribeToMessages, unsubscribeFromMessages } from '@/utils/chat';

type CustomRequest = {
  id: string;
  created_at: string;
  product_description: string;
  status: string;
  category: string | null;
  image_url: string | null;
  product_link: string | null;
  notes: string | null;
};

type Message = {
  id: string;
  custom_request_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender_profile: {
    full_name: string;
  } | null;
};

const CustomRequestDetail = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [request, setRequest] = useState<CustomRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const messageChannel = useRef<any>(null);
  const requestChannel = useRef<any>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId) {
        console.log('No requestId provided');
        navigate('/account');
        return;
      }

      if (!session) {
        console.log('No session available');
        navigate('/login');
        return;
      }

      console.log('Fetching request data for ID:', requestId, 'User ID:', session.user.id);
      
      const { data, error } = await supabase
        .from('custom_requests')
        .select('*', { head: false })
        .eq('id', requestId)
        .eq('user_id', session.user.id)
        .single();

      console.log('Request fetch result:', { data, error });

      if (error || !data) {
        console.error('Failed to fetch request:', error);
        showError('Could not find the specified request.');
        navigate('/account');
      } else {
        console.log('Setting request data:', data);
        console.log('Current request status in state:', request?.status, 'New status from DB:', data.status);
        setRequest(data as unknown as CustomRequest);
      }
      setLoading(false);
    };

    fetchRequest();
    
    // Set up real-time subscription for request updates
    if (requestId && session) {
      console.log('Setting up real-time subscription for request:', requestId);
      
      // Remove existing channel if it exists
      if (requestChannel.current) {
        console.log('Removing existing channel');
        supabase.removeChannel(requestChannel.current);
      }
      
      requestChannel.current = supabase
        .channel(`request-changes-${requestId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'custom_requests',
            filter: `id=eq.${requestId}`
          },
          (payload) => {
            console.log('Received real-time update for request:', payload);
            console.log('Old status:', request?.status, 'New status:', payload.new.status);
            // Update the request in state when it's updated
            setRequest(payload.new as unknown as CustomRequest);
          }
        )
        .subscribe((status) => {
          console.log('Real-time subscription status:', status);
        });
    }
    
    // Cleanup function
    return () => {
      if (requestChannel.current) {
        console.log('Cleaning up real-time subscription');
        supabase.removeChannel(requestChannel.current);
      }
    };
  }, [requestId, navigate, session]);

  useEffect(() => {
    // Subscribe to real-time updates when chat is open
    if (isChatOpen && requestId) {
      // Unsubscribe from previous channel if exists
      if (messageChannel.current) {
        unsubscribeFromMessages(messageChannel.current);
      }
      
      // Subscribe to new messages
      messageChannel.current = subscribeToMessages(
        requestId,
        (newMessage) => {
          setMessages(prev => [...prev, newMessage]);
        }
      );
    }
    
    // Cleanup function
    return () => {
      if (messageChannel.current) {
        unsubscribeFromMessages(messageChannel.current);
      }
    };
  }, [isChatOpen, requestId]);

  const fetchMessages = async () => {
    if (!requestId) return;

    // First fetch the messages
    const { data: messages, error: messagesError } = await supabase
      .from('custom_request_messages')
      .select('id, custom_request_id, sender_id, message, created_at')
      .eq('custom_request_id', requestId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return;
    }

    // If no messages, set empty array and return
    if (!messages || messages.length === 0) {
      setMessages([]);
      return;
    }

    // Get unique sender IDs
    const senderIds = [...new Set(messages.map((msg: any) => msg.sender_id))];

    // Fetch profiles for all senders
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', senderIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      // Set messages without profile info
      setMessages(messages.map((msg: any) => ({
        ...msg,
        sender_profile: null
      })) as unknown as Message[]);
      return;
    }

    // Create a map of profiles for quick lookup
    const profileMap = profiles.reduce((acc: any, profile: any) => {
      acc[profile.id] = profile;
      return acc;
    }, {});

    // Combine messages with profile info
    const messagesWithProfiles = messages.map((msg: any) => ({
      ...msg,
      sender_profile: profileMap[msg.sender_id] || null
    }));

    setMessages(messagesWithProfiles as unknown as Message[]);
  };

  const handleOpenChat = async () => {
    setIsChatOpen(true);
    await fetchMessages();
  };

  const handleSendMessage = async () => {
    if (!session || !requestId || !newMessage.trim()) return;

    console.log('Sending message:', {
      custom_request_id: requestId,
      sender_id: session.user.id,
      message: newMessage.trim()
    });

    try {
      const { data, error } = await supabase
        .from('custom_request_messages')
        .insert({
          custom_request_id: requestId,
          sender_id: session.user.id,
          message: newMessage.trim()
        })
        .select('*, sender_profile:profiles(full_name)');

      console.log('Message insert result:', { data, error });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('Could not find the table')) {
          showError('Chat functionality is not set up yet. Please run the database migration script from the migrations folder.');
        } else if (error.message.includes('permission denied')) {
          showError('You do not have permission to send messages for this request.');
        } else if (error.message.includes('violates foreign key constraint')) {
          showError('Invalid request ID. Please refresh the page and try again.');
        } else {
          showError('Failed to send message: ' + error.message);
        }
        console.error('Failed to send message:', error);
        return;
      }

      const newMsg = data[0] as unknown as Message;
      // Add message to state immediately for better UX
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      showSuccess('Message sent successfully!');
    } catch (error: any) {
      console.error('Unexpected error sending message:', error);
      showError('An unexpected error occurred while sending the message.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!request) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Button variant="ghost" onClick={() => navigate('/account')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Account
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Request Details</CardTitle>
              <CardDescription>Submitted on {format(new Date(request.created_at), 'PPP')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-1">Product Description</h3>
                <p className="text-muted-foreground">{request.product_description}</p>
              </div>
              {request.notes && (
                <div>
                  <h3 className="font-semibold mb-1">Additional Notes</h3>
                  <p className="text-muted-foreground">{request.notes}</p>
                </div>
              )}
              {request.product_link && (
                <div>
                  <h3 className="font-semibold mb-1">Product Link</h3>
                  <a href={request.product_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                    {request.product_link} <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Status</span>
                <div className="flex items-center gap-2">
                  <Badge variant={request.status === 'pending' ? 'secondary' : 'default'}>
                    {request.status}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={fetchRequest}
                    className="h-6 w-6 p-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                      <path d="M21 3v5h-5"/>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                      <path d="M3 21v-5h5"/>
                    </svg>
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Category</span>
                <span>{request.category || 'N/A'}</span>
              </div>
              <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleOpenChat} className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat with Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Chat about Request: {request.product_description.substring(0, 30)}...</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4 overflow-y-auto h-full">
                        {messages.map((message) => (
                          <div 
                            key={message.id} 
                            className={`p-3 rounded-lg ${
                              message.sender_id === session?.user.id 
                                ? 'bg-primary text-primary-foreground ml-10' 
                                : 'bg-muted mr-10'
                            }`}
                          >
                            <div className="font-medium text-sm">
                              {message.sender_profile?.full_name || 'Admin'}
                            </div>
                            <div className="mt-1">{message.message}</div>
                            <div className="text-xs opacity-70 mt-1">
                              {format(new Date(message.created_at), 'PPp')}
                            </div>
                          </div>
                        ))}
                        {messages.length === 0 && (
                          <p className="text-center text-muted-foreground py-8">
                            No messages yet. Start the conversation!
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      Send
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
          {request.image_url && (
            <Card>
              <CardHeader>
                <CardTitle>Submitted Image</CardTitle>
              </CardHeader>
              <CardContent>
                <a href={request.image_url} target="_blank" rel="noopener noreferrer">
                  <img 
                    src={request.image_url} 
                    alt="Custom request" 
                    className="rounded-md w-full h-auto object-cover" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                      target.onerror = null;
                    }}
                  />
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomRequestDetail;