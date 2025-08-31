import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import ProductCard from "./ProductCard";
import { Skeleton } from "./ui/skeleton";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

const PopularProducts = () => {
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, price, image_url')
        .limit(4);

      if (error) {
        console.error('Error fetching products:', error);
        showError('Could not fetch popular products.');
      } else if (data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-secondary py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-black uppercase text-center mb-8">Popular Items</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex flex-col space-y-3">
                <Skeleton className="h-[256px] w-full rounded-t-md" />
                <div className="space-y-2 p-4 flex-grow">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="p-4 pt-0">
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                imageUrl={product.image_url}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PopularProducts;