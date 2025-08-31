import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import { showError, showSuccess } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Session } from '@supabase/supabase-js';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
}

const ADMIN_EMAIL = "mredza31@gmail.com";

const CategoryPage = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!categoryName) return;
      setLoading(true);
      // Get the KShopper Platform id
      const { data: platforms, error: platformError } = await supabase
        .from('platforms')
        .select('id')
        .eq('name', 'KShopper Platform')
        .limit(1);
      if (platformError || !platforms || platforms.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      const platformId = platforms[0].id;
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, price, image_url, description, platform_id, category')
        .eq('category', categoryName)
        .eq('platform_id', platformId);
      if (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } else {
        setProducts(data as MenuItem[]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [categoryName]);

  const formattedCategoryName = categoryName
    ? categoryName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'Category';

  // Handler to delete a product
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) {
      showError('Failed to delete item.');
    } else {
      showSuccess('Item deleted.');
      setProducts(products.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-black uppercase mb-8">{formattedCategoryName}</h1>
      {session?.user?.email === ADMIN_EMAIL && (
        <div className="mb-6 flex justify-end">
          <Button asChild>
            <Link to={`/admin/products/new?category=${categoryName}`}>Add Product</Link>
          </Button>
        </div>
      )}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.price}
                imageUrl={product.image_url}
              />
              {session?.user?.email === ADMIN_EMAIL && (
                <button
                  onClick={() => handleDelete(product.id)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded px-2 py-1 text-xs opacity-80 hover:opacity-100 z-10"
                  title="Delete Item"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">No products found in this category yet.</p>
          {session?.user?.email === ADMIN_EMAIL ? (
            <Button asChild className="mt-4">
              <Link to={`/admin/products/new?category=${categoryName}`}>Add Product</Link>
            </Button>
          ) : (
            <Button asChild className="mt-4">
              <Link to="/">Continue Shopping</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;