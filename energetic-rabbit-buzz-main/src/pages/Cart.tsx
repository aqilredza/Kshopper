import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { showError, showSuccess } from '@/utils/toast';

type CartItem = {
  id: string;
  quantity: number;
  menu_items: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  } | null;
};

const Cart = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const getSessionAndCart = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      } else {
        setSession(session);
        await fetchCartItems(session.user.id);
      }
      setLoading(false);
    };

    getSessionAndCart();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login');
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchCartItems = async (userId: string) => {
    setCartLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        menu_items (
          id,
          name,
          price,
          image_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      showError("Could not fetch your cart items.");
      console.error(error);
    } else if (data) {
      setCartItems(data.filter(item => item.menu_items) as unknown as CartItem[]);
    }
    setCartLoading(false);
  };

  const handleRemoveItem = async (cartItemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) {
      showError('Failed to remove item from cart.');
    } else {
      showSuccess('Item removed from cart.');
      setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    const { data: orderId, error } = await supabase.rpc('create_order_from_cart');

    if (error) {
      showError(error.message || 'Checkout failed. Please try again.');
      console.error('Checkout error:', error);
    } else {
      showSuccess('Order placed successfully!');
      navigate(`/order-confirmation/${orderId}`);
    }
    setIsCheckingOut(false);
  };

  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.menu_items?.price ?? 0) * item.quantity;
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black uppercase text-center mb-8">Your Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {cartLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-16 border rounded-md">
              <p className="text-lg text-muted-foreground">Your cart is currently empty.</p>
              <Button onClick={() => navigate('/')} className="mt-4">Continue Shopping</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map(item => item.menu_items && (
                <Card key={item.id} className="flex items-center p-4">
                  <img 
                    src={item.menu_items.image_url || `https://placehold.co/100x100/f1f5f9/1e293b?text=No+Image`} 
                    alt={item.menu_items.name}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="ml-4 flex-grow">
                    <h3 className="font-bold text-lg">{item.menu_items.name}</h3>
                    <p className="text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg">MYR {(item.menu_items.price * item.quantity).toFixed(2)}</p>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleRemoveItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-black uppercase">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold">MYR {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-bold">TBD</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-black">
                  <span>Total</span>
                  <span>MYR {subtotal.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isCheckingOut}>
                  {isCheckingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;