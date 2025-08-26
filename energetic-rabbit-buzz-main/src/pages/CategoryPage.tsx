import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Session } from '@supabase/supabase-js';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
  restaurants: {
    slug: string;
  } | null;
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
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          price,
          image_url,
          description,
          restaurant_platforms (
            restaurants (
              slug
            )
          )
        `)
        .eq('category', categoryName);

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        // The type from Supabase is complex, so we cast it carefully
        const formattedData = data.map((item: any) => ({
          ...item,
          restaurants: item.restaurant_platforms?.restaurants,
        }));
        setProducts(formattedData as MenuItem[]);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [categoryName]);

  const formattedCategoryName = categoryName
    ? categoryName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'Category';

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-black uppercase mb-8">{formattedCategoryName}</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.image_url}
            />
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