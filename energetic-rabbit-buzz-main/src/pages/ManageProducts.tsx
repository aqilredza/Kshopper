import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import EditProductForm from '@/components/admin/EditProductForm';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  description: string;
}

const ManageProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Get the KShopper Platform id
      const { data: platforms, error: platformError } = await supabase
        .from('platforms')
        .select('id')
        .eq('name', 'KShopper Platform')
        .limit(1);
      
      if (platformError || !platforms || platforms.length === 0) {
        showError('Failed to load platform information.');
        setLoading(false);
        return;
      }
      
      const platformId = platforms[0].id;
      
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, price, image_url, category, description')
        .eq('platform_id', platformId)
        .order('category')
        .order('name');
      
      if (error) {
        showError('Failed to load products: ' + error.message);
        setProducts([]);
      } else {
        setProducts(data as Product[]);
      }
    } catch (error) {
      showError('Unexpected error loading products.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeletingId(productId);
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', productId);
      
      if (error) {
        showError('Failed to delete product: ' + error.message);
      } else {
        showSuccess('Product deleted successfully.');
        setProducts(products.filter(product => product.id !== productId));
      }
    } catch (error) {
      showError('Unexpected error deleting product.');
      console.error('Error:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingProduct(null);
    fetchProducts(); // Refresh the product list
  };

  const handleEditCancel = () => {
    setIsEditDialogOpen(false);
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black uppercase">Manage Products</h1>
      </div>
      
      {products.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No products found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <div className="relative">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-t-lg">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                    disabled={deletingId === product.id}
                  >
                    {deletingId === product.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg">MYR {product.price.toFixed(2)}</span>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">{product.category}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <EditProductForm 
              product={editingProduct} 
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageProducts;