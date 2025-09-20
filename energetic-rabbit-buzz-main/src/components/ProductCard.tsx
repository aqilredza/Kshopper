import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from './ui/skeleton';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export const ProductCardSkeleton = () => {
  return (
    <Card className="overflow-hidden w-full">
      <Skeleton className="w-full h-48" />
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-10 w-1/2" />
      </CardFooter>
    </Card>
  );
}

const ProductCard = ({ id, name, price, imageUrl }: ProductCardProps) => {
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    setAdding(true);
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showError('Please log in to add items to your cart.');
      navigate('/login');
      setAdding(false);
      return;
    }
    const userId = session.user.id;
    // Check if item already in cart
    const { data: existing, error: fetchError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('menu_item_id', id)
      .single();
    if (fetchError && fetchError.code !== 'PGRST116') {
      showError('Could not add to cart.');
      setAdding(false);
      return;
    }
    if (existing) {
      // Update quantity
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id);
      if (updateError) {
        showError('Could not update cart.');
      } else {
        showSuccess('Cart updated!');
      }
    } else {
      // Insert new cart item
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({ user_id: userId, menu_item_id: id, quantity: 1 });
      if (insertError) {
        showError('Could not add to cart.');
      } else {
        showSuccess('Added to cart!');
      }
    }
    setAdding(false);
  };

  return (
    <Card className="overflow-hidden transition-transform transform hover:scale-105 hover:shadow-lg w-full">
      <Link to={`/product/${id}`} className="block">
        <CardHeader className="p-0">
          <img src={imageUrl || '/placeholder.svg'} alt={name} className="w-full h-48 object-cover" />
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg font-bold truncate">{name}</CardTitle>
        </CardContent>
      </Link>
      <CardFooter className="p-4 flex justify-between items-center">
  <p className="text-xl font-black">MYR {price.toFixed(2)}</p>
        <Button onClick={handleAddToCart} disabled={adding}>{adding ? 'Adding...' : 'Add to Cart'}</Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;