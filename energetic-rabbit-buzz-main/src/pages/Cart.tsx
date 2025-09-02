import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Loader2, Trash2, ShoppingCart } from 'lucide-react';
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
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black uppercase mb-4">
          <span className="bg-gradient-to-r from-red-500 via-pink-500 to-blue-600 bg-clip-text text-transparent">
            Your Shopping Cart
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Review your items and proceed to checkout
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
          <div className="lg:col-span-2">
          {cartLoading ? (
            <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-lg">
              <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex items-center justify-center min-h-[500px]">
              <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl">
                <div className="text-center p-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <ShoppingCart className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Your cart is empty</h3>
                  <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet</p>
                  <Button 
                    onClick={() => navigate('/')} 
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-xl"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map(item => item.menu_items && (
                <Card 
                  key={item.id} 
                  className="flex items-center p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white"
                >
                  <div className="relative">
                    <img 
                      src={item.menu_items.image_url || `https://placehold.co/120x120/f1f5f9/1e293b?text=No+Image`} 
                      alt={item.menu_items.name}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="ml-6 flex-grow">
                    <h3 className="font-bold text-xl text-gray-800">{item.menu_items.name}</h3>
                    <p className="text-muted-foreground mt-1">MYR {item.menu_items.price.toFixed(2)} each</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-2xl text-gray-800">MYR {(item.menu_items.price * item.quantity).toFixed(2)}</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-red-500 hover:bg-red-50 mt-4" 
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="lg:col-span-1">
            <Card className="rounded-2xl shadow-lg border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-black uppercase text-center">
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                    Order Summary
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 py-6">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Subtotal ({cartItems.reduce((total, item) => total + item.quantity, 0)} items)</span>
                  <span className="font-bold text-lg">MYR {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-bold">FREE</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-bold">Calculated at checkout</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-2xl font-black items-center">
                  <span>Total</span>
                  <span className="text-red-500">MYR {subtotal.toFixed(2)}</span>
                </div>
                <div className="text-xs text-muted-foreground text-center mt-4">
                  By proceeding, you agree to our Terms and Conditions
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-6 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300" 
                  size="lg" 
                  onClick={handleCheckout} 
                  disabled={isCheckingOut}
                >
                  {isCheckingOut && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>
            
            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                className="w-full py-6 rounded-xl border-2 hover:border-red-300 hover:bg-red-50 text-lg font-bold"
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;