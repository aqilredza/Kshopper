import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PlusCircle } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  image_url: string;
}

const FeaturedCategories = ({ hideTitle = false }: { hideTitle?: boolean }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .limit(7);
      if (error) {
        console.error('Error fetching categories:', error);
      } else if (data) {
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section
      className="py-12"
      style={{
        background: "linear-gradient(120deg, #fff 0%, #ffe5e5 40%, #e5f0ff 100%)"
      }}
    >
      <div className="container mx-auto px-4">
        {!hideTitle && <h2 className="text-3xl font-bold text-center mb-8">Featured Categories</h2>}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link to={`/category/${category.name.toLowerCase()}`} key={category.id}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white rounded-2xl shadow flex flex-col h-full">
                <CardContent className="p-0 flex-1 flex flex-col">
                  <img src={category.image_url} alt={category.name} className="w-full h-64 object-cover" />
                  <div className="p-6 flex-1 flex flex-col justify-center">
                    <p className="font-semibold text-center">{category.name}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          <Link to="/custom-request">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full bg-white rounded-2xl shadow flex flex-col">
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                  <PlusCircle className="w-16 h-16 text-gray-500" />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-center">
                  <p className="font-semibold text-center">Request an Item</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;