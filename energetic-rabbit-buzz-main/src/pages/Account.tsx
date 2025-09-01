// All import statements must be at the top
// ...imports moved to top, remove duplicates below...

// ...existing code...
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { Loader2, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showError, showSuccess } from '@/utils/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type OrderItem = {
  id: string;
  quantity: number;
  menu_items: {
    name: string;
    image_url: string | null;
  };
};
type Order = {
  id: string;
  created_at: string;
  total_price: number;
  status: string;
  items?: OrderItem[];
};

type CustomRequest = {
  id: string;
  created_at: string;
  product_description: string;
  status: string;
  image_url: string | null;
  product_link: string | null;
  notes: string | null;
  category: string | null;
};

type Profile = {
  full_name: string;
  avatar_url: string;
  contact_number?: string;
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


const Account = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Read tab param from query string
  const params = new URLSearchParams(location.search);
  const tabParam = params.get('tab');
  const validTabs = ['orders', 'requests'];
  const initialTab = validTabs.includes(tabParam || '') ? tabParam : 'orders';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+60'); // Default to Malaysia
  const [contactNumberError, setContactNumberError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [messages, setMessages] = useState<{[key: string]: Message[]}>({});
  const [newMessage, setNewMessage] = useState<{[key: string]: string}>({});
  const [openChatRequestId, setOpenChatRequestId] = useState<string | null>(null);
  const messageChannels = useRef<{[key: string]: any}>({});

  const [editMode, setEditMode] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Initial data loading useEffect (moved inside component)
  useEffect(() => {
    // Update tab if query param changes
    if (tabParam && validTabs.includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
    async function getInitialData() {
      try {
        console.log('[DEBUG] Fetching Supabase session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          setLoadError('Supabase session error: ' + sessionError.message);
          setLoading(false);
          return;
        }
        if (!session) {
          setLoadError('No session found. You will be redirected to login.');
          setTimeout(() => navigate('/login'), 2000);
          setLoading(false);
          return;
        }
        setSession(session);
        setUser(session.user);
        console.log('[DEBUG] Fetching profile for user:', session.user.id);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, contact_number')
          .eq('id', session.user.id)
          .single();
        if (profileError) {
          setLoadError('Profile error: ' + profileError.message);
          setLoading(false);
          return;
        }
        if (profileData) {
          setProfile(profileData);
          setFullName(profileData.full_name || '');
          // Split contact_number into country code and number for UI
          if (profileData.contact_number) {
            const match = profileData.contact_number.match(/^(\+\d{1,3})(\d{6,})$/);
            if (match) {
              setCountryCode(match[1]);
              setContactNumber(match[2]);
            } else {
              setCountryCode('+60'); // fallback
              setContactNumber(profileData.contact_number);
            }
          } else {
            setCountryCode('+60');
            setContactNumber('');
          }
        }
        console.log('[DEBUG] Fetching orders for user:', session.user.id);
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('id, created_at, total_price, status, order_items(id, quantity, menu_items(name, image_url))')
          .eq('user_id', session.user.id)
          .neq('status', 'deleted')
          .order('created_at', { ascending: false });
        if (ordersError) {
          setLoadError('Orders error: ' + ordersError.message);
          setLoading(false);
          return;
        }
        if (ordersData) {
          setOrders(ordersData.map((order: any) => ({
            ...order,
            items: order.order_items || [],
          })));
        }
        console.log('[DEBUG] Fetching custom requests for user:', session.user.id);
        const { data: requestsData, error: requestsError } = await supabase
          .from('custom_requests')
          .select('id, created_at, product_description, status, image_url, product_link, notes, category')
          .eq('user_id', session.user.id)
          .neq('status', 'deleted')
          .order('created_at', { ascending: false });
        if (requestsError) {
          setLoadError('Custom requests error: ' + requestsError.message);
          setLoading(false);
          return;
        }
        if (requestsData) setCustomRequests(requestsData);
        setLoading(false);
        console.log('[DEBUG] Finished loading all data.');
      } catch (err: any) {
        setLoadError('Unexpected error: ' + (err?.message || err));
        setLoading(false);
        console.error('[DEBUG] Unexpected error:', err);
      }
    }
    getInitialData();
  }, [navigate]);

  // ...existing code...
// ...existing code...

  useEffect(() => {
    // Subscribe to real-time updates when a chat is opened
    if (openChatRequestId) {
      // Unsubscribe from previous channel if exists
      if (messageChannels.current[openChatRequestId]) {
        unsubscribeFromMessages(messageChannels.current[openChatRequestId]);
      }
      
      // Subscribe to new messages
      messageChannels.current[openChatRequestId] = subscribeToMessages(
        openChatRequestId,
        (newMessage) => {
          setMessages(prev => ({
            ...prev,
            [openChatRequestId]: [...(prev[openChatRequestId] || []), newMessage]
          }));
        }
      );
    }
    
    // Cleanup function
    return () => {
      if (openChatRequestId && messageChannels.current[openChatRequestId]) {
        unsubscribeFromMessages(messageChannels.current[openChatRequestId]);
        delete messageChannels.current[openChatRequestId];
      }
    };
  }, [openChatRequestId]);

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
    setOpenChatRequestId(requestId);
    const fetchedMessages = await fetchMessages(requestId);
    setMessages(prev => ({
      ...prev,
      [requestId]: fetchedMessages
    }));
  };

  const handleSendMessage = async (requestId: string) => {
    if (!session || !newMessage[requestId]?.trim()) return;

    console.log('Sending message:', {
      custom_request_id: requestId,
      sender_id: session.user.id,
      message: newMessage[requestId].trim()
    });

    try {
      const { data, error } = await supabase
        .from('custom_request_messages')
        .insert({
          custom_request_id: requestId,
          sender_id: session.user.id,
          message: newMessage[requestId].trim()
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
      // Don't add to state here since real-time subscription will handle it
      // setMessages(prev => ({
      //   ...prev,
      //   [requestId]: [...(prev[requestId] || []), newMsg]
      // }));

      setNewMessage(prev => ({
        ...prev,
        [requestId]: ''
      }));

      showSuccess('Message sent successfully!');
    } catch (error: any) {
      console.error('Unexpected error sending message:', error);
      showError('An unexpected error occurred while sending the message.');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/avatar.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    try {
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true
        });
      
      if (uploadError) {
        showError('Failed to upload avatar: ' + uploadError.message);
        return;
      }
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);
      
      if (updateError) {
        showError('Failed to update profile: ' + updateError.message);
        return;
      }
      
      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      showSuccess('Avatar updated successfully!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      showError('Failed to upload avatar.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        {/* Debug: show loading state */}
        <div className="ml-4 text-gray-500">Loading profile data...</div>
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 font-bold">{loadError}</p>
          <p className="mt-2">Please check your Supabase configuration, network connection, and database schema.</p>
          {/* Debug: show raw profile data if available */}
          <pre className="mt-4 text-xs text-left bg-gray-100 p-2 rounded border overflow-x-auto">{JSON.stringify(profile, null, 2)}</pre>
        </div>
      </div>
    );
  }

  // ...existing code...

  // Update profile information
  const handleProfileUpdate = async (e: React.FormEvent, fullContactNumber?: string) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ 
        full_name: fullName, 
        contact_number: fullContactNumber || countryCode + contactNumber 
      })
      .eq('id', user.id);

    if (error) {
      showError('Failed to update profile.');
    } else {
      showSuccess('Profile updated successfully!');
    }
    setIsSaving(false);
  };

  // Validate contact number before submitting
  const handleProfileUpdateWithContact = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contactNumber.trim()) {
      setContactNumberError('Contact number is required.');
      return;
    }
    setContactNumberError('');
    handleProfileUpdate(e, countryCode + contactNumber);
  };


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black uppercase text-center mb-8">My Account</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditMode((v) => !v)}>
                {editMode ? 'Cancel' : 'Edit'}
              </Button>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <form onSubmit={handleProfileUpdateWithContact} className="space-y-4">
                  <div className="flex flex-col items-center mb-4">
                    <div className="relative">
                      <img
                        src={profile?.avatar_url || "/placeholder.svg"}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-2 border-muted"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                          target.onerror = null;
                        }}
                      />
                      <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Click to upload new avatar</p>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user?.email || ''} disabled />
                  </div>
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="contactNumber">Contact Number<span className="text-red-500">*</span></Label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={e => setCountryCode(e.target.value)}
                        className="border rounded-md px-2 py-1 bg-white"
                        style={{ minWidth: 80 }}
                      >
                        <option value="+60">🇲🇾 +60</option>
                        <option value="+65">🇸🇬 +65</option>
                        <option value="+62">🇮🇩 +62</option>
                        <option value="+66">🇹🇭 +66</option>
                        <option value="+82">🇰🇷 +82</option>
                        <option value="+81">🇯🇵 +81</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        {/* Add more as needed */}
                      </select>
                      <Input
                        id="contactNumber"
                        type="tel"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        required
                        placeholder="123456789"
                      />
                    </div>
                    {contactNumberError && (
                      <p className="text-xs text-red-500 mt-1">{contactNumberError}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col items-center mb-4">
                    <img
                      src={profile?.avatar_url || "/placeholder.svg"}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-muted"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                        target.onerror = null;
                      }}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <div className="border rounded-md px-3 py-2 bg-muted">{user?.email || '-'}</div>
                  </div>
                  <div>
                    <Label>Full Name</Label>
                    <div className="border rounded-md px-3 py-2 bg-muted">{fullName || '-'}</div>
                  </div>
                  <div>
                    <Label>Contact Number</Label>
                    <div className="border rounded-md px-3 py-2 bg-muted">{profile && profile.contact_number !== undefined && profile.contact_number !== null && profile.contact_number !== '' ? profile.contact_number : 'Not set'}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="orders">Order History</TabsTrigger>
              <TabsTrigger value="requests">Custom Requests</TabsTrigger>
            </TabsList>
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>View your past orders.</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Refresh button removed */}
                  {orders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">You haven't placed any orders yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date/Time</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium truncate max-w-[120px] sm:max-w-xs cursor-pointer" onClick={() => navigate(`/order/${order.id}`)}>{order.id}</TableCell>
                            <TableCell>{format(new Date(order.created_at), 'PPP p')}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-2">
                                {order.items && order.items.length > 0 ? order.items.map(item => (
                                  <div key={item.id} className="flex items-center gap-2">
                                    {item.menu_items?.image_url && (
                                      <img src={item.menu_items.image_url} alt={item.menu_items.name} className="w-10 h-10 object-cover rounded" />
                                    )}
                                    <span className="truncate max-w-[120px]">{item.menu_items?.name || 'No name'}</span>
                                    <span className="text-xs text-muted-foreground ml-2">x{item.quantity}</span>
                                  </div>
                                )) : <span className="text-xs text-muted-foreground">No items</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">MYR {order.total_price.toFixed(2)}</TableCell>
                            <TableCell>
                              {order.status === 'pending' && (
                                <Button size="sm" variant="outline" onClick={async (e) => {
                                  e.stopPropagation();
                                  const { error } = await supabase
                                    .from('orders')
                                    .update({ status: 'cancelled' })
                                    .eq('id', order.id)
                                    .eq('user_id', user?.id);
                                  if (error) {
                                    showError('Failed to cancel order.');
                                  } else {
                                    showSuccess('Order cancelled.');
                                    setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o));
                                  }
                                }}>Cancel</Button>
                              )}
                              <Button size="sm" variant="destructive" className="ml-2" onClick={async (e) => {
                                e.stopPropagation();
                                if (!window.confirm('Are you sure you want to remove this order?')) return;
                                const { error } = await supabase
                                  .from('orders')
                                  .update({ status: 'deleted' })
                                  .eq('id', order.id)
                                  .eq('user_id', user?.id);
                                if (error) {
                                  showError('Failed to remove order.');
                                } else {
                                  showSuccess('Order removed.');
                                  setOrders(orders.filter(o => o.id !== order.id));
                                }
                              }}>Remove</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Requests</CardTitle>
                  <CardDescription>View your special product requests.</CardDescription>
                </CardHeader>
                <CardContent>
                  {customRequests.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">You haven't made any custom requests yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Request</TableHead>
                          <TableHead>Image</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customRequests.map((request) => (
                          <TableRow key={request.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium max-w-xs">
                              <div className="flex flex-col">
                                <span className="truncate">{request.product_description}</span>
                                {request.product_link && (
                                  <a href={request.product_link} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline mt-1">
                                    Product Link
                                  </a>
                                )}
                                {request.notes && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Notes: {request.notes}
                                  </p>
                                )}
                                {request.category && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Category: {request.category}
                                  </p>
                                )}
                              </div>
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
                                        target.src = "/korean-signature.jpg";
                                        target.onerror = null;
                                      }}
                                    />
                                  </div>
                                </a>
                              ) : (
                                <img src="/korean-signature.jpg" alt="Korean Signature" className="w-16 h-16 object-cover rounded-md bg-muted" />
                              )}
                            </TableCell>
                            <TableCell>{format(new Date(request.created_at), 'PPP')}</TableCell>
                            <TableCell>
                              <Badge variant={request.status === 'pending' ? 'secondary' : 'default'}>
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-2">
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
                                      <ScrollArea className="h-[400px] pr-4">
                                        <div className="space-y-4">
                                          {(messages[request.id] || []).map((message) => (
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
                                          {(messages[request.id] || []).length === 0 && (
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
                                  onClick={async () => {
                                    if (!window.confirm('Are you sure you want to remove this custom request?')) return;
                                    const { error } = await supabase
                                      .from('custom_requests')
                                      .update({ status: 'deleted' })
                                      .eq('id', request.id)
                                      .eq('user_id', user?.id);
                                    if (error) {
                                      showError('Failed to remove custom request.');
                                    } else {
                                      showSuccess('Custom request removed.');
                                      setCustomRequests(customRequests.filter(r => r.id !== request.id));
                                    }
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default Account;