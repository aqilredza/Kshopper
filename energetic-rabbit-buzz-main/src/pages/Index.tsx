import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import FeaturedCategories from "@/components/FeaturedCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import HeroImage from "@/components/HeroImage";

interface HotItem {
  id: string;
  title: string;
  image_url: string;
  menu_item_id: string | null;
}

const Index = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [hotItems, setHotItems] = useState<HotItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('hot_items')
        .select('*'); // Removed .order('display_order')
      
      if (error) {
        console.error("Error fetching hot items:", error);
      } else {
        setHotItems(data);
      }
      setLoading(false);
    };
    fetchHotItems();
  }, []);

  return (
    <div
      className="text-foreground min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(120deg, #fff 0%, #ffe5e5 40%, #e5f0ff 100%)"
      }}
    >
      <main className="flex-1">
        <section
          className="pt-20 pb-12 relative overflow-hidden"
          style={{
            background: "linear-gradient(120deg, #fff 0%, #ffe5e5 40%, #e5f0ff 100%)"
          }}
        >
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between relative z-10">
            <div className="flex-1 flex flex-col items-start justify-center">
              <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                Your Gateway to<br />
                <span className="bg-gradient-to-r from-red-500 via-pink-500 to-blue-600 bg-clip-text text-transparent">Korean Shopping</span>
              </h1>
              <p className="text-lg text-gray-700 mb-8 max-w-2xl">
                Connect with trusted personal shoppers in Korea. Get authentic K-beauty, fashion, snacks, and lifestyle products delivered right to Malaysia.
              </p>
              <div className="flex gap-4">
                <button 
                  className="bg-red-500 text-white font-bold py-3 px-8 rounded-lg shadow hover:bg-red-600 transition"
                  onClick={() => {
                    const hotItemsSection = document.getElementById('hot-items');
                    if (hotItemsSection) {
                      hotItemsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  Start Shopping
                </button>
              </div>
            </div>
            <div className="flex-1 flex justify-end items-center relative h-[400px]">
              <HeroImage />
            </div>
          </div>
        </section>

        <section className="py-12" id="hot-items">
          <h2 className="text-4xl font-black text-center mb-8">Hot Items</h2>
          <div className="container mx-auto flex flex-col md:flex-row gap-8 justify-center items-stretch">
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow flex-1 flex flex-col overflow-hidden max-w-xs mx-auto">
                  <Skeleton className="w-full h-64" />
                  <div className="p-6 flex-1 flex flex-col">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-12 w-full mt-auto" />
                  </div>
                </div>
              ))
            ) : (
              hotItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow flex-1 flex flex-col overflow-hidden max-w-xs mx-auto">
                  <img src={item.image_url} alt={item.title} className="w-full h-64 object-cover" />
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-xl font-semibold mb-4">{item.title}</div>
                    <div className="mt-auto flex flex-col gap-2">
                      {item.menu_item_id && (
                        <Button asChild className="bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
                          <Link to={`/product/${item.menu_item_id}`}>View Product</Link>
                        </Button>
                      )}
                      <Button asChild variant="outline" className="font-bold py-3 rounded-lg transition">
                        <Link to="/custom-request">Request Items</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="py-12">
          <h2 className="text-4xl font-black text-center mb-0">Shop by Category</h2>
          <FeaturedCategories hideTitle />
        </section>
      </main>
    </div>
  );
}

export default Index;