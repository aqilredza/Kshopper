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
    <section className="py-12">
      <div className="container mx-auto px-4">
        {!hideTitle && (
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-red-500 via-pink-500 to-blue-600 bg-clip-text text-transparent">Featured Categories</span>
          </h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link to={`/category/${category.name.toLowerCase()}`} key={category.id} className="transform transition-all duration-300 hover:-translate-y-2">
              <Card className="overflow-hidden bg-white rounded-3xl shadow-xl flex flex-col h-full hover:shadow-2xl">
                <CardContent className="p-0 flex-1 flex flex-col">
                  <img src={category.image_url} alt={category.name} className="w-full h-64 object-cover" />
                  <div className="p-6 flex-1 flex flex-col justify-center">
                    <p className="font-bold text-center text-gray-800">{category.name}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          <Link to="/custom-request" className="transform transition-all duration-300 hover:-translate-y-2">
            <Card className="overflow-hidden h-full bg-white rounded-3xl shadow-xl flex flex-col hover:shadow-2xl">
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="w-full h-64 bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
                  <PlusCircle className="w-16 h-16 text-red-400" />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-center">
                  <p className="font-bold text-center text-gray-800">Request an Item</p>
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