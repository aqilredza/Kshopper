import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { Loader2, Trash2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showError, showSuccess } from '@/utils/toast';
import { format } from 'date-fns';
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

type Profile = {
  full_name: string;
};

type CustomRequest = {
  id: string;
  created_at: string;
  product_description: string;
  status: string;
  image_url: string | null;
  product_link: string | null;
  notes: string | null;
  profiles: Profile | null;
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

const ADMIN_EMAIL = "mredza31@gmail.com";

const CustomRequestsList = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [messages, setMessages] = useState<{[key: string]: Message[]}>({});
  const [newMessage, setNewMessage] = useState<{[key: string]: string}>({});
  const [openChatRequestId, setOpenChatRequestId] = useState<string | null>(null);
  const messageChannels = useRef<{[key: string]: any}>({});
  const requestsChannel = useRef<any>(null);
  const scrollAreaRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  
  // Function to scroll to bottom of chat for a specific request
  const scrollToBottom = useCallback((requestId: string) => {
    // Use a longer timeout to ensure DOM is fully updated
    setTimeout(() => {
      const scrollArea = scrollAreaRefs.current[requestId];
      if (scrollArea) {
        // Scroll the actual scrollable element (the viewport)
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }, 100);
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const getInitialData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email !== ADMIN_EMAIL) {
        navigate('/login');
      } else {
        setSession(session);
        await fetchRequests();
      }
      if (isMounted) {
        setLoading(false);
      }
    };
    
    getInitialData();
    
    // Set up real-time subscription for custom requests
    requestsChannel.current = supabase
      .channel('custom-requests-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'custom_requests'
        },
        (payload) => {
          // Refresh the requests list when there are new requests
          fetchRequests();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'custom_requests'
        },
        (payload) => {
          // Refresh the requests list when requests are updated
          fetchRequests();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'custom_requests'
        },
        (payload) => {
          // Refresh the requests list when requests are deleted
          fetchRequests();
        }
      )
      .subscribe();
    
    // Cleanup function
    return () => {
      isMounted = false;
      // Unsubscribe from all message channels
      Object.values(messageChannels.current).forEach(channel => {
        unsubscribeFromMessages(channel);
      });
      // Unsubscribe from requests channel
      if (requestsChannel.current) {
        supabase.removeChannel(requestsChannel.current);
      }
    };
  }, [navigate]);

  // Subscribe to real-time updates when a chat is opened
  useEffect(() => {
    if (!openChatRequestId) return;
    // Clear previous messages for this request (but keep temporary messages)
    setMessages(prev => {
      const currentMessages = prev[openChatRequestId] || [];
      // Keep only temporary messages
      const tempMessages = currentMessages.filter(m => m.id.startsWith('temp-'));
      return { ...prev, [openChatRequestId]: tempMessages };
    });
    // Fetch messages once when opening chat
    const fetchMessages = async () => {
      const { data: msgs, error } = await supabase
        .from('custom_request_messages')
        .select('id, custom_request_id, sender_id, message, created_at, sender_profile:profiles(full_name)')
        .eq('custom_request_id', openChatRequestId)
        .order('created_at', { ascending: true });
      if (!error && msgs) {
        // Map sender_profile from array to single object (or null)
        const mappedMsgs = msgs.map((msg: any) => ({
          ...msg,
          sender_profile: Array.isArray(msg.sender_profile) ? msg.sender_profile[0] || null : msg.sender_profile || null
        }));
        setMessages(prev => {
          // Get existing temporary messages
          const tempMessages = (prev[openChatRequestId] || []).filter(m => m.id.startsWith('temp-'));
          // Combine with new messages and deduplicate
          const all = [...tempMessages, ...mappedMsgs];
          const deduped = Array.from(new Map(all.map(m => [m.id, m])).values());
          return { ...prev, [openChatRequestId]: deduped };
        });
      }
    };
    fetchMessages();
    // Subscribe to new messages
    if (messageChannels.current[openChatRequestId]) {
      unsubscribeFromMessages(messageChannels.current[openChatRequestId]);
    }
    const channel = subscribeToMessages(openChatRequestId, async (newMsg) => {
      // Fetch profile information for the new message sender
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', newMsg.sender_id)
        .single();
      const messageWithProfile = {
        ...newMsg,
        sender_profile: profileError ? null : profile
      };
      setMessages(prev => {
        // Prevent duplicate messages
        const existing = prev[openChatRequestId] || [];
        // Filter out any temporary messages with the same content
        const filteredExisting = existing.filter(m => 
          !(m.id.startsWith('temp-') && m.message === messageWithProfile.message)
        );
        // Check if message already exists
        if (filteredExisting.some(m => m.id === messageWithProfile.id)) return prev;
        return {
          ...prev,
          [openChatRequestId]: [...filteredExisting, messageWithProfile]
        };
      });
      scrollToBottom(openChatRequestId);
    });
    messageChannels.current[openChatRequestId] = channel;
    // Cleanup on close or switch
    return () => {
      if (messageChannels.current[openChatRequestId]) {
        unsubscribeFromMessages(messageChannels.current[openChatRequestId]);
        delete messageChannels.current[openChatRequestId];
      }
    };
  }, [openChatRequestId, scrollToBottom]);

  // Scroll to bottom when messages change or chat is opened
  useEffect(() => {
    if (openChatRequestId) {
      scrollToBottom(openChatRequestId);
    }
  }, [openChatRequestId, scrollToBottom]);

  // Scroll to bottom when messages are updated
  useEffect(() => {
    if (openChatRequestId && messages[openChatRequestId]) {
      scrollToBottom(openChatRequestId);
    }
  }, [messages, openChatRequestId, scrollToBottom]);

  const fetchRequests = async () => {
    console.log('Fetching custom requests...');
    
    // Fetch requests for display, excluding those with status 'deleted'
    const { data, error } = await supabase
      .from('custom_requests')
      .select('*, profiles(full_name, contact_number)', { count: 'exact', head: false })
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });

    console.log('Fetch result for display (excluding deleted):', { data, error, dataLength: data?.length });

    if (error) {
      showError('Could not fetch custom requests.');
      console.error(error);
    } else if (data) {
      // Load deleted requests from localStorage and filter them out
      const savedDeleted = localStorage.getItem('deletedRequests');
      let deletedIds = new Set<string>();
      if (savedDeleted) {
        try {
          deletedIds = new Set(JSON.parse(savedDeleted));
          console.log('Loaded deleted requests from localStorage:', Array.from(deletedIds));
        } catch (e) {
          console.error('Error parsing deleted requests:', e);
        }
      }
      
      // Filter out deleted requests
      const filteredData = data.filter(req => !deletedIds.has(req.id));
      console.log('Filtered data (removed deleted):', filteredData.length, 'original:', data.length);
      console.log('Setting requests state:', filteredData);
      
      // Log each request's status for debugging
      filteredData.forEach(req => {
        console.log(`Request ${req.id}: status = ${req.status}`);
      });
      
      setRequests(filteredData as unknown as CustomRequest[]);
      console.log('Requests updated in state, new count:', filteredData.length);
    }
  };

  const refreshRequests = async () => {
    console.log('Manually refreshing requests...');
    console.log('Current requests in state before refresh:', requests);
    setLoading(true);
    await fetchRequests();
    setLoading(false);
  };

  const fetchMessages = async (requestId: string) => {
    // First fetch the messages
    const { data: messages, error: messagesError } = await supabase
      .from('custom_request_messages')
      .select('id, custom_request_id, sender_id, message, created_at')
      .eq('custom_request_id', requestId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return [];
    }

    // If no messages, return early
    if (!messages || messages.length === 0) {
      return [];
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
      // Return messages without profile info
      return messages.map((msg: any) => ({
        ...msg,
        sender_profile: null
      }));
    }

    // Create a map of profiles for quick lookup
    const profileMap = profiles.reduce((acc: any, profile: any) => {
      acc[profile.id] = profile;
      return acc;
    }, {});

    // Combine messages with profile info
    return messages.map((msg: any) => ({
      ...msg,
      sender_profile: profileMap[msg.sender_id] || null
    }));
  };

  const handleOpenChat = async (requestId: string) => {
    console.log('Opening chat for request:', requestId);
    setOpenChatRequestId(requestId);
    const fetchedMessages = await fetchMessages(requestId);
    console.log('Fetched messages:', fetchedMessages);
    setMessages(prev => ({
      ...prev,
      [requestId]: fetchedMessages
    }));
    
    // Scroll to bottom after messages are loaded
    scrollToBottom(requestId);
  };

  const handleSendMessage = async (requestId: string) => {
    if (!session || !newMessage[requestId]?.trim()) return;
    const messageToSend = newMessage[requestId].trim();

    console.log('Sending message:', {
      custom_request_id: requestId,
      sender_id: session.user.id,
      message: messageToSend
    });

    try {
      // Add the message to the UI immediately to provide instant feedback
      const tempMessage = {
        id: 'temp-' + Date.now(), // Temporary ID
        custom_request_id: requestId,
        sender_id: session.user.id,
        message: messageToSend,
        created_at: new Date().toISOString(),
        sender_profile: {
          full_name: 'You'
        }
      };
      
      setMessages(prev => ({
        ...prev,
        [requestId]: [...(prev[requestId] || []), tempMessage]
      }));
      
      setNewMessage(prev => ({
        ...prev,
        [requestId]: ''
      }));

      const { data, error } = await supabase
        .from('custom_request_messages')
        .insert({
          custom_request_id: requestId,
          sender_id: session.user.id,
          message: messageToSend
        })
        .select('*, sender_profile:profiles(full_name)');

      console.log('Message insert result:', { data, error });

      if (error) {
        // Remove the temporary message if there was an error
        setMessages(prev => ({
          ...prev,
          [requestId]: (prev[requestId] || []).filter(msg => msg.id !== tempMessage.id)
        }));
        
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
        // Restore the message in the input field
        setNewMessage(prev => ({
          ...prev,
          [requestId]: messageToSend
        }));
        return;
      }

      // Replace the temporary message with the real one
      setMessages(prev => ({
        ...prev,
        [requestId]: [
          ...(prev[requestId] || []).filter(msg => msg.id !== tempMessage.id),
          data[0]
        ]
      }));
      
      showSuccess('Message sent successfully!');
    } catch (error: any) {
      console.error('Unexpected error sending message:', error);
      showError('An unexpected error occurred while sending the message.');
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    console.log('Attempting to update request status:', { requestId, newStatus });
    
    try {
      // Perform the update - the RLS policies will allow this for admins
      console.log('Performing update operation...');
      const { data, error } = await supabase
        .from('custom_requests')
        .update({ status: newStatus })
        .eq('id', requestId)
        .select();

      console.log('Status update result:', { data, error });

      if (error) {
        console.error('Failed to update status:', error);
        showError('Failed to update status: ' + error.message);
      } else {
        console.log('Status update successful:', data);
        if (data && data.length > 0) {
          console.log('Updated request data from DB:', data[0]);
        }
        showSuccess('Request status updated.');
        // Update the request in the local state
        setRequests(prev => {
          const updatedRequests = prev.map(req => {
            if (req.id === requestId) {
              console.log('Updating request in state:', req.id, 'from', req.status, 'to', newStatus);
              const updatedReq = { ...req, status: newStatus };
              console.log('Updated request object:', updatedReq);
              return updatedReq;
            }
            return req;
          });
          return updatedRequests;
        });
      }
    } catch (err) {
      console.error('Unexpected error updating status:', err);
      showError('An unexpected error occurred while updating the status.');
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      return;
    }

    try {
      // Add to localStorage deleted requests
      const savedDeleted = localStorage.getItem('deletedRequests');
      let deletedIds = new Set<string>();
      if (savedDeleted) {
        try {
          deletedIds = new Set(JSON.parse(savedDeleted));
        } catch (e) {
          console.error('Error parsing deleted requests:', e);
        }
      }
      deletedIds.add(requestId);
      localStorage.setItem('deletedRequests', JSON.stringify(Array.from(deletedIds)));
      
      // Try to update status to 'deleted' as a soft delete
      const { error } = await supabase
        .from('custom_requests')
        .update({ status: 'deleted' })
        .eq('id', requestId);

      if (error) {
        console.error('Database update failed:', error);
        // Even if database update fails, we still hide it locally
      }

      showSuccess('Request deleted successfully.');
      // Update UI immediately
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error: any) {
      showError('Failed to delete request.');
      console.error('Delete error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl font-black uppercase">Custom Requests</CardTitle>
              <CardDescription>Review and manage user-submitted product requests.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refreshRequests}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M3 21v-5h5"/>
              </svg>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No custom requests have been submitted yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{format(new Date(request.created_at), 'PPp')}</TableCell>
                    <TableCell>{request.profiles?.full_name || 'N/A'}</TableCell>
                    <TableCell>{request.profiles?.contact_number || 'N/A'}</TableCell>
                    <TableCell className="max-w-xs">
                      <p className="font-medium truncate">{request.product_description}</p>
                      {request.product_link && <a href={request.product_link} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline">Product Link</a>}
                      {request.notes && <p className="text-xs text-muted-foreground mt-1">Notes: {request.notes}</p>}
                    </TableCell>
                    <TableCell>
                      {request.image_url ? (
                        <a href={request.image_url} target="_blank" rel="noopener noreferrer">
                          <div className="w-16 h-16 rounded-md overflow-hidden">
                            <img 
                              src={request.image_url} 
                              alt="Request" 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                                target.onerror = null;
                              }}
                            />
                          </div>
                        </a>
                      ) : (
                        <img src="/placeholder.svg" alt="No Image" className="w-16 h-16 object-cover rounded-md bg-muted" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select value={request.status} onValueChange={(value) => {
                          console.log('Status select changed:', { requestId: request.id, oldStatus: request.status, newStatus: value });
                          handleStatusChange(request.id, value);
                        }}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Set status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="ordered">Ordered</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={async () => {
                          console.log('Force refreshing single request:', request.id);
                          const { data, error } = await supabase
                            .from('custom_requests')
                            .select('*')
                            .eq('id', request.id)
                            .single();
                          if (data) {
                            console.log('Fetched latest request data:', data);
                            setRequests(prev => 
                              prev.map(req => req.id === request.id ? data as unknown as CustomRequest : req)
                            );
                          }
                        }}
                      >
                        ↻
                      </Button>
                      <Dialog open={openChatRequestId === request.id} onOpenChange={(open) => {
                        if (!open) setOpenChatRequestId(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenChat(request.id)}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                          <DialogHeader>
                            <DialogTitle>Chat about Request: {request.product_description.substring(0, 30)}...</DialogTitle>
                          </DialogHeader>
                          <div className="flex-1 overflow-hidden">
                            <div className="h-[400px] pr-4 overflow-y-auto" ref={(el) => { scrollAreaRefs.current[request.id] = el; }}>
                              <div className="space-y-4">
                                {(messages[request.id] || [])
                                  .filter(m => !m.id.startsWith('temp-')) // Filter out temporary messages
                                  .filter((m, index, self) => 
                                    index === self.findIndex(m2 => m2.id === m.id) // Deduplicate by id
                                  )
                                  .map((message) => (
                                    <div 
                                      key={message.id} 
                                      className={`p-3 rounded-lg ${
                                        message.sender_id === session?.user.id 
                                          ? 'bg-primary text-primary-foreground ml-10' 
                                          : 'bg-muted mr-10'
                                      }`}
                                    >
                                      <div className="font-medium text-sm">
                                        {message.sender_profile?.full_name || 'User'}
                                      </div>
                                      <div className="mt-1">{message.message}</div>
                                      <div className="text-xs opacity-70 mt-1">
                                        {format(new Date(message.created_at), 'PPp')}
                                      </div>
                                    </div>
                                  ))}
                                {(messages[request.id] || []).filter(m => !m.id.startsWith('temp-')).length === 0 && (
                                  <p className="text-center text-muted-foreground py-8">
                                    No messages yet. Start the conversation!
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Textarea
                              placeholder="Type your message..."
                              value={newMessage[request.id] || ''}
                              onChange={(e) => setNewMessage(prev => ({
                                ...prev,
                                [request.id]: e.target.value
                              }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage(request.id);
                                }
                              }}
                              className="flex-1"
                            />
                            <Button 
                              onClick={() => handleSendMessage(request.id)}
                              disabled={!newMessage[request.id]?.trim()}
                            >
                              Send
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteRequest(request.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomRequestsList;