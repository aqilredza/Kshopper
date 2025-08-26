import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  name: string;
  imageUrl: string;
}

const CategoryCard = ({ name, imageUrl }: CategoryCardProps) => {
  const categorySlug = name.toLowerCase().replace(/\s+/g, '-');

  return (
    <Link to={`/category/${categorySlug}`}>
      <Card className="group cursor-pointer overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            <img src={imageUrl} alt={name} className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110" />
          </div>
          <div className="p-4">
            <h3 className="text-2xl font-black uppercase text-center">{name}</h3>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;