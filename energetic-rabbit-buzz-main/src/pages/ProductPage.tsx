import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { showError, showSuccess } from '@/utils/toast';
import { Home, ChevronRight, Loader2 } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from '@/components/ui/button';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

const ProductPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', productId)
        .single();

      if (error || !data) {
        console.error('Error fetching product:', error);
        showError('Could not find the requested product.');
        navigate('/');
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [productId, navigate]);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAddingToCart(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showError("Please log in to add items to your cart.");
      navigate('/login');
      setIsAddingToCart(false);
      return;
    }

    const user = session.user;

    const { data: existingItem, error: fetchError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('menu_item_id', product.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      showError('Could not add item to cart. Please try again.');
      setIsAddingToCart(false);
      return;
    }

    if (existingItem) {
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + 1 })
        .eq('id', existingItem.id);
      
      if (updateError) showError('Could not update item in cart.');
      else showSuccess('Item quantity updated in your cart!');
    } else {
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({ user_id: user.id, menu_item_id: product.id, quantity: 1 });

      if (insertError) showError('Could not add item to cart.');
      else showSuccess('Item added to your cart!');
    }
    setIsAddingToCart(false);
  };

  const categorySlug = product?.category.toLowerCase().replace(/\s+/g, '-') || '';

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="w-full h-96 rounded-md" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      ) : product && (
        <>
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link to="/"><Home className="h-4 w-4" /></Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator><ChevronRight /></BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link to={`/category/${categorySlug}`}>{product.category}</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator><ChevronRight /></BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img src={product.image_url} alt={product.name} className="w-full h-auto object-cover rounded-lg shadow-lg" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-4xl font-black uppercase">{product.name}</h1>
              <p className="text-3xl font-bold my-4">{`MYR ${product.price.toFixed(2)}`}</p>
              <p className="text-muted-foreground flex-grow">{product.description}</p>
              <Button size="lg" className="mt-6 w-full" onClick={handleAddToCart} disabled={isAddingToCart}>
                {isAddingToCart ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductPage;