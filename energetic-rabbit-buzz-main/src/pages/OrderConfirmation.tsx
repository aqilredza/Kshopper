import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { showError } from '@/utils/toast';

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  menu_items: {
    name: string;
    image_url: string;
  } | null;
};

type Order = {
  id: string;
  total_price: number;
  created_at: string;
  order_items: OrderItem[];
};

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_price,
          created_at,
          order_items (
            id,
            quantity,
            price,
            menu_items (
              name,
              image_url
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (error || !data) {
        showError('Could not find your order.');
        navigate('/');
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
    return null; // or some other fallback UI
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-3xl font-black uppercase">Thank You For Your Order!</CardTitle>
          <p className="text-muted-foreground">Your order has been placed successfully.</p>
          <p className="text-sm text-muted-foreground">Order ID: {order.id}</p>
        </CardHeader>
        <CardContent>
          <Separator className="my-4" />
          <h3 className="font-bold text-lg mb-4">Order Summary</h3>
          <div className="space-y-4">
            {order.order_items.map(item => item.menu_items && (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <img src={item.menu_items.image_url} alt={item.menu_items.name} className="w-16 h-16 rounded-md object-cover mr-4" />
                  <div>
                    <p className="font-bold">{item.menu_items.name}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-bold">MYR {(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between text-xl font-black">
            <span>Total</span>
            <span>MYR {order.total_price.toFixed(2)}</span>
          </div>
          <Link to="/" className="w-full">
            <Button className="w-full mt-6" size="lg">Continue Shopping</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderConfirmation;