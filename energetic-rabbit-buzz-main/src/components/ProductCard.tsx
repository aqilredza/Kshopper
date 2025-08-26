import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
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
        <p className="text-xl font-black">${price.toFixed(2)}</p>
        <Button>Add to Cart</Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;