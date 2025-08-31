import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { showError, showSuccess } from '@/utils/toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  menu_items: {
    name: string;
    image_url: string | null;
  } | null;
}

interface Order {
  id: string;
  user_id: string;
  created_at: string;
  total_price: number;
  status: string;
  profiles?: {
    full_name: string;
  } | null;
  order_items?: OrderItem[];
}

const ADMIN_EMAIL = "mredza31@gmail.com";

const ManageOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      
      try {
        // First, check if we're authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Session data:', session);
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          showError('Authentication error. Please refresh the page.');
          setLoading(false);
          return;
        }
        
        if (!session) {
          console.error('No session found');
          showError('Not authenticated. Please log in.');
          setLoading(false);
          return;
        }
        
        const isAdmin = session?.user?.email === ADMIN_EMAIL;
        
        console.log('Fetching orders as admin:', isAdmin, 'User email:', session?.user?.email);
        
        // Fetch orders without trying to join profiles
        let query = supabase
          .from('orders')
          .select('id, user_id, created_at, total_price, status')
          .neq('status', 'deleted')
          .order('created_at', { ascending: false });
        
        // For non-admin users, filter by their user_id
        if (!isAdmin) {
          query = query.eq('user_id', session?.user?.id);
        }
        
        const { data: ordersData, error: ordersError } = await query;
        
        console.log('Orders query result:', { ordersData, ordersError });
        
        if (ordersError) {
          console.error('Orders query error:', ordersError);
          showError(`Failed to fetch orders: ${ordersError.message}`);
          setOrders([]);
          setLoading(false);
          return;
        }
        
        // Handle case where there are no orders
        if (!ordersData || ordersData.length === 0) {
          console.log('No orders found');
          setOrders([]);
          setLoading(false);
          return;
        }
        
        // Fetch profiles for all users in the orders
        const userIds = [...new Set(ordersData.map((order: any) => order.user_id))]; // Remove duplicates
        console.log('Fetching profiles for user IDs:', userIds);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, contact_number')
          .in('id', userIds);
        
        console.log('Profiles query result:', { profilesData, profilesError });
        
        // Combine orders with profile data
        const ordersWithProfiles = ordersData.map((order: any) => {
          const profile = profilesData?.find((p: any) => p.id === order.user_id);
          return {
            ...order,
            profiles: profile || { full_name: 'Unknown User' }
          };
        });
        
        console.log('Orders with profiles:', ordersWithProfiles);
        
        // Fetch order items using materialized view as fallback
  const ordersWithItems = await Promise.all(
    ordersWithProfiles.map(async (order: Order) => {
      console.log(`Fetching order items for order ${order.id}...`);
      
      try {
        // First, try the standard approach
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            id,
            order_id,
            menu_item_id,
            quantity,
            price,
            menu_items (
              name,
              image_url
            )
          `)
          .eq('order_id', order.id);
        
        if (!itemsError && orderItems && orderItems.length > 0) {
          console.log(`✅ Standard query successful for order ${order.id}:`, orderItems);
          return { ...order, order_items: orderItems };
        }
        
        console.log(`⚠️ Standard query failed for order ${order.id}:`, itemsError);
        
        // Fallback to materialized view
        const { data: viewData, error: viewError } = await supabase
          .from('admin_order_view')
          .select('*')
          .eq('order_id', order.id);
        
        if (!viewError && viewData && viewData.length > 0) {
          console.log(`✅ Materialized view successful for order ${order.id}:`, viewData);
          
          // Transform view data to match expected format
          const transformedItems = viewData.map((item: any) => ({
            id: item.order_item_id,
            order_id: item.order_id,
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            price: item.price,
            menu_items: {
              name: item.menu_item_name,
              image_url: item.menu_item_image
            }
          }));
          
          return { ...order, order_items: transformedItems };
        }
        
        console.log(`⚠️ Materialized view also failed for order ${order.id}:`, viewError);
        
        // Return order with empty items if all approaches fail
        return { ...order, order_items: viewData || [] };
      } catch (err) {
        console.error(`Unexpected error fetching items for order ${order.id}:`, err);
        return { ...order, order_items: [] };
      }
    })
  );
        
        // Add debugging for order items
        ordersWithItems.forEach((order: Order) => {
          console.log(`Order ${order.id} has ${order.order_items?.length || 0} items:`);
          order.order_items?.forEach((item, index) => {
            console.log(`  Item ${index + 1}:`, {
              id: item.id,
              menu_item_id: item.menu_item_id,
              name: item.menu_items?.name,
              image_url: item.menu_items?.image_url,
              quantity: item.quantity,
              price: item.price
            });
          });
        });
        
        console.log('Final orders data:', ordersWithItems);
        setOrders(ordersWithItems);
      } catch (err) {
        console.error('Unexpected error:', err);
        showError('An unexpected error occurred while fetching orders.');
      }
      
      setLoading(false);
    };
    
    fetchOrders();
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black uppercase text-center mb-8">Manage Orders</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>Review all submitted orders from users.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No orders found.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Note: Orders will appear here after users complete the checkout process.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium truncate max-w-[120px] sm:max-w-xs">{order.id}</TableCell>
                      <TableCell className="truncate max-w-[120px] sm:max-w-xs">{order.profiles?.full_name || order.user_id}</TableCell>
                      <TableCell>{order.profiles?.contact_number || 'N/A'}</TableCell>
                      <TableCell>
                        <div>{format(new Date(order.created_at), 'PPP')}</div>
                        <div className="text-xs text-muted-foreground">{format(new Date(order.created_at), 'p')}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'pending' ? 'secondary' : order.status === 'accepted' ? 'default' : order.status === 'rejected' ? 'destructive' : 'default'}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">MYR {order.total_price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              View Items ({order.order_items?.length || 0})
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>Order Items - {order.id.substring(0, 8)}</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="h-[60vh] pr-4">
                              <div className="space-y-4">
                                {order.order_items && order.order_items.length > 0 ? (
                                  order.order_items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                                      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                                        <img
                                          src={item.menu_items?.image_url || "/placeholder.svg"}
                                          alt={item.menu_items?.name || "Product"}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = "/placeholder.svg";
                                            target.onerror = null;
                                          }}
                                        />
                                      </div>
                                      <div className="flex-grow">
                                        <h4 className="font-medium">{item.menu_items?.name || "Unknown Item"}</h4>
                                        <p className="text-sm text-muted-foreground">
                                          Quantity: {item.quantity} × MYR {item.price.toFixed(2)} = MYR {(item.quantity * item.price).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Item ID: {item.menu_item_id.substring(0, 8)}...
                                        </p>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-8">
                                    <p className="text-muted-foreground">No items found for this order.</p>
                                    <div className="mt-4 text-sm text-muted-foreground">
                                      <p className="font-medium">Possible reasons:</p>
                                      <ul className="list-disc list-inside text-left mt-2 space-y-1">
                                        <li>The order was created before item tracking was implemented</li>
                                        <li>There was an issue during the checkout process</li>
                                        <li>The order was created through a different system</li>
                                      </ul>
                                      <p className="mt-3">
                                        <span className="font-medium">Note:</span> For orders to show items, users must 
                                        complete the normal checkout process which automatically creates item records.
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell>
                        {order.status === 'pending' && (
                          <>
                            <button
                              className="bg-green-600 text-white rounded px-2 py-1 text-xs mr-2 hover:bg-green-700"
                              onClick={async () => {
                                const { data, error } = await supabase
                                  .from('orders')
                                  .update({ status: 'accepted' })
                                  .eq('id', order.id)
                                  .select();
                                console.log('Order update result:', { data, error });
                                if (error) {
                                  showError('Failed to accept order.');
                                } else if (!data || data.length === 0) {
                                  showError('No order was updated. Check RLS or permissions.');
                                } else {
                                  showSuccess('Order accepted.');
                                  setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'accepted' } : o));
                                }
                              }}
                            >Accept</button>
                            <button
                              className="bg-red-600 text-white rounded px-2 py-1 text-xs hover:bg-red-700"
                              onClick={async () => {
                                const { error } = await supabase
                                  .from('orders')
                                  .update({ status: 'rejected' })
                                  .eq('id', order.id);
                                if (error) {
                                  showError('Failed to reject order.');
                                } else {
                                  showSuccess('Order rejected.');
                                  setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'rejected' } : o));
                                }
                              }}
                            >Reject</button>
                          </>
                        )}
                        <button
                          className="bg-gray-700 text-white rounded px-2 py-1 text-xs ml-2 hover:bg-black"
                          onClick={async () => {
                            if (!window.confirm('Are you sure you want to remove this order?')) return;
                            const { error } = await supabase
                              .from('orders')
                              .update({ status: 'deleted' })
                              .eq('id', order.id);
                            if (error) {
                              showError('Failed to remove order.');
                            } else {
                              showSuccess('Order removed.');
                              setOrders(orders.filter(o => o.id !== order.id));
                            }
                          }}
                        >Remove</button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageOrders;