import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { showError } from '@/utils/toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  menu_items: {
    id: string;
    name: string;
    image_url: string;
  } | null;
};

type Order = {
  id: string;
  total_price: number;
  created_at: string;
  status: string;
  order_items: OrderItem[];
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        navigate('/account');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_price,
          created_at,
          status,
          order_items (
            id,
            quantity,
            price,
            menu_items (
              id,
              name,
              image_url
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (error || !data) {
        showError('Could not find the specified order.');
        navigate('/account');
      } else {
        setOrder(data as unknown as Order);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Button variant="ghost" onClick={() => navigate('/account')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to My Account
      </Button>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-black uppercase">Order Details</CardTitle>
          <CardDescription>
            Order ID: {order.id} <br />
            Placed on {format(new Date(order.created_at), 'PPP')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.order_items.map(item => item.menu_items && (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <img 
                    src={item.menu_items.image_url || `https://placehold.co/100x100/f1f5f9/1e293b?text=No+Image`} 
                    alt={item.menu_items.name} 
                    className="w-16 h-16 rounded-md object-cover mr-4" 
                  />
                  <div>
                    <Link to={`/product/${item.menu_items.id}`} className="font-bold hover:underline">{item.menu_items.name}</Link>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-bold">MYR {(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <Separator className="my-6" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Status</span>
              <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                {order.status}
              </Badge>
            </div>
            <div className="flex justify-between text-xl font-black">
              <span>Total</span>
              <span>MYR {order.total_price.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetail;