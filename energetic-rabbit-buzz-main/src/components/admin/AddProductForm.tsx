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

type RestaurantPlatform = {
  id: string;
  restaurants: { name: string } | null;
  platforms: { name: string } | null;
};

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
      // Removed image_url and restaurant_platform_id as they are not direct form inputs
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!category) {
        showError('Category is missing. Cannot add product.');
        return;
    }
    setIsSubmitting(true);
    let imageUrl = '';
    if (values.image_file && values.image_file instanceof File) {
      const { data, error: uploadError } = await supabase.storage.from('product-images').upload(`products/${Date.now()}_${values.image_file.name}`, values.image_file);
      if (uploadError) {
        showError('Failed to upload image.');
        setIsSubmitting(false);
        return;
      }
      // Corrected access to publicUrl
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path);
      imageUrl = urlData?.publicUrl || '';
    }
    const { error } = await supabase.from('menu_items').insert([
      {
        name: values.name,
        description: values.description,
        price: values.price,
        image_url: imageUrl,
        category: category,
      },
    ]);
    if (error) {
      showError(error.message || 'Failed to add product.');
    } else {
      showSuccess('Product added successfully!');
      navigate(`/category/${category}`);
    }
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
  {/* Restaurant selection removed as requested */}
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
      </form>
    </Form>
  );
};

export default AddProductForm;