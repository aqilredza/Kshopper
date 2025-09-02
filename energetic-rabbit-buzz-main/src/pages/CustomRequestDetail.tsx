import { useEffect, useState, useRef } from 'react';
// ...existing code...
import { subscribeToMessages, unsubscribeFromMessages } from '@/utils/chat';
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

const CustomRequestDetail = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [request, setRequest] = useState<CustomRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const subscriptionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
        setRequest(data as unknown as CustomRequest);
      }
      setLoading(false);
    };

    fetchRequest();
  }, [requestId, navigate, session]);

  // Subscribe and fetch messages only when chatbox is open
  useEffect(() => {
    if (!requestId || !isChatOpen) return;
    console.log('[User Chat] Subscribing to', requestId);
    // Clean up any existing subscription
    if (subscriptionRef.current) {
      console.log('[User Chat] Unsubscribing from', requestId);
      unsubscribeFromMessages(subscriptionRef.current);
      subscriptionRef.current = null;
    }
    // Fetch messages when chatbox is opened
    fetchMessagesForChat();
    // Subscribe to new messages for this request using the utility (same as admin)
    const channel = subscribeToMessages(requestId, (newMsg) => {
      console.log('[User Chat] Subscription callback fired for message:', newMsg);
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        const exists = prev.some(msg => msg.id === newMsg.id);
        if (exists) {
          return prev; // Message already exists, don't add it
        }
        
        // Add the new message
        const all = [...prev, newMsg];
        // Sort by created_at ascending
        all.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        return all;
      });
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    });
    subscriptionRef.current = channel;
    // Cleanup on close or requestId change
    return () => {
      if (subscriptionRef.current) {
        console.log('[User Chat] Unsubscribing from', requestId);
        unsubscribeFromMessages(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [requestId, isChatOpen]);

  const fetchMessagesForChat = async () => {
    if (!requestId) return;
    
    console.log('Fetching messages for chat');
    
    const { data, error } = await supabase
      .from('custom_request_messages')
      .select('*')
      .eq('custom_request_id', requestId)
      .order('created_at', { ascending: true });
    
    console.log('Messages fetched:', data, error);
    
    if (!error && data) {
      setMessages(prev => {
        // Combine with new data
        const all = [...prev, ...data];
        // Deduplicate by id
        const deduped = Array.from(new Map(all.map(m => [m.id, m])).values());
        // Sort by created_at ascending
        deduped.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        return deduped;
      });
      // Scroll to bottom after loading
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  const handleOpenChat = async () => {
    console.log('Opening chat');
    setIsChatOpen(true);
  };

  const handleSendMessage = async () => {
    if (!session || !requestId || !newMessage.trim()) return;
    const messageToSend = newMessage.trim();

    try {
      console.log('[User Chat] Attempting to insert message:', messageToSend);
      
      // Send the message to the server
      const { error, data } = await supabase
        .from('custom_request_messages')
        .insert({
          custom_request_id: requestId,
          sender_id: session.user.id,
          message: messageToSend
        })
        .select();

      console.log('[User Chat] Insert result:', data, error);

      if (error) {
        showError('Failed to send message: ' + error.message);
        console.error('Failed to send message:', error);
        return;
      }

      // Clear the input field
      setNewMessage('');
      showSuccess('Message sent successfully!');
      // The message will appear via real-time subscription, no need to add it manually
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
                    onClick={() => window.location.reload()}
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
              <Dialog open={isChatOpen} onOpenChange={(open) => {
                setIsChatOpen(open);
                if (!open) {
                  // Dialog is closing, unsubscribe
                  if (subscriptionRef.current) {
                    console.log('[User Chat] Unsubscribing from', requestId);
                    unsubscribeFromMessages(subscriptionRef.current);
                    subscriptionRef.current = null;
                  }
                } else {
                  // Dialog is opening, ensure we have latest messages
                  handleOpenChat();
                }
              }}>
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
                      <div 
                        ref={scrollRef}
                        className="space-y-4"
                      >
                        {/* Filter out temporary messages and deduplicate by id before rendering */}
                        {messages
                          .filter(m => !m.id.startsWith('temp-')) // Filter out temporary messages
                          .filter((m, index, self) => 
                            index === self.findIndex(m2 => m2.id === m.id) // Deduplicate by id
                          )
                          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                          .map((message) => {
                            // Strict sender label logic
                            const senderLabel = message.sender_id === session.user.id
                              ? (session.user.user_metadata?.full_name || 'You')
                              : 'Admin';
                            return (
                              <div
                                key={message.id}
                                className={`p-3 rounded-lg ${
                                  message.sender_id === session.user.id
                                    ? 'bg-primary text-primary-foreground ml-10'
                                    : 'bg-muted mr-10'
                                }`}
                              >
                                <div className="font-medium text-sm">
                                  {senderLabel}
                                </div>
                                <div className="mt-1">{message.message}</div>
                                <div className="text-xs opacity-70 mt-1">
                                  {format(new Date(message.created_at), 'PPp')}
                                </div>
                              </div>
                            );
                          })}
                        {messages.filter(m => !m.id.startsWith('temp-')).length === 0 && (
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