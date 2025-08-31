import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Product name is required.' }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: 'Price must be a positive number.' }),
  image_file: z.any().optional(),
  category: z.string().min(1, { message: 'Category is required.' }),
});

const EditProductForm = ({ product, onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImage, setCurrentImage] = useState(product.image_url || '');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    let imageUrl = currentImage;
    
    // Upload new image if provided
    if (values.image_file && values.image_file instanceof File) {
      const fileExt = values.image_file.name.split('.').pop();
      const fileName = `products/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, values.image_file);
      
      if (uploadError) {
        showError('Failed to upload image.');
        setIsSubmitting(false);
        return;
      }
      
      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      
      imageUrl = publicUrl;
    }
    
    // Update product in menu_items table
    const { error } = await supabase
      .from('menu_items')
      .update({
        name: values.name,
        description: values.description || '',
        price: values.price,
        image_url: imageUrl,
        category: values.category,
      })
      .eq('id', product.id);
    
    if (error) {
      console.error('Database error details:', error);
      showError(`Database error: ${error.message}`);
    } else {
      showSuccess('Product updated successfully!');
      onSuccess();
    }
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Kimchi Jjigae" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A short description of the product" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="k-beauty">K-Beauty</SelectItem>
                  <SelectItem value="k-fashion">K-Fashion</SelectItem>
                  <SelectItem value="k-food">K-Food</SelectItem>
                  <SelectItem value="k-lifestyle">K-Lifestyle</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-4">
          <div>
            <FormLabel>Current Image</FormLabel>
            {currentImage ? (
              <img 
                src={currentImage} 
                alt="Current product" 
                className="w-full h-32 object-cover rounded mt-2"
              />
            ) : (
              <div className="w-full h-32 bg-gray-200 flex items-center justify-center rounded mt-2">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
          </div>
          <FormField
            control={form.control}
            name="image_file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Replace Image (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => field.onChange(e.target.files?.[0])} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex space-x-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Product
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditProductForm;