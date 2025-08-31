"use client";

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
import { useLocation, useNavigate } from 'react-router-dom';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Product name is required.' }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: 'Price must be a positive number.' }),
  image_file: z.any().refine((file) => file instanceof File || file === undefined, {
    message: 'Please upload an image file.'
  }).optional(),
});

const AddProductForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const category = new URLSearchParams(location.search).get('category');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
    },
  });

  // Function to get the KShopper Platform id
  const getKShopperPlatformId = async () => {
    const { data: platforms, error } = await supabase
      .from('platforms')
      .select('id, name')
      .eq('name', 'KShopper Platform')
      .limit(1);
    if (error) {
      console.error('Error fetching platforms:', error);
      return null;
    }
    if (platforms && platforms.length > 0) {
      return platforms[0].id;
    }
    return null;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!category) {
        showError('Category is missing. Cannot add product.');
        return;
    }
    setIsSubmitting(true);
    let imageUrl = '';
    
    // Upload image to Supabase storage
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
    
    // Get the KShopper Platform id
    const platformId = await getKShopperPlatformId();
    if (!platformId) {
      showError('Database setup required: Run the complete_setup.sql script in your Supabase dashboard. See README.md for instructions.');
      setIsSubmitting(false);
      return;
    }
    // Insert product into menu_items table with platform_id
    const { data, error } = await supabase
      .from('menu_items')
      .insert([
        {
          name: values.name,
          description: values.description || '',
          price: values.price,
          image_url: imageUrl,
          category: category,
          platform_id: platformId
        },
      ])
      .select();
    
    if (error) {
      console.error('Database error details:', error);
      
      // Provide more specific error messages
      if (error.message.includes('row-level security')) {
        showError('Permission denied: You must be logged in as admin (mredza31@gmail.com) to add products. If you are the admin, the database policies may need to be updated.');
      } else {
        showError(`Database error: ${error.message}`);
      }
    } else {
      console.log('Product added successfully to menu_items:', data);
      showSuccess('Product added successfully!');
      navigate(`/category/${category}`);
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
          name="image_file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Image</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={e => field.onChange(e.target.files?.[0])} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Product
        </Button>
        <div className="text-sm text-muted-foreground">
          <p><strong>Note:</strong> Database setup required. See README.md for setup instructions.</p>
        </div>
      </form>
    </Form>
  );
};

export default AddProductForm;