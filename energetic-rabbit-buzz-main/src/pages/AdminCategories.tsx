import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Loader2, PlusCircle, Edit, Trash2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showError, showSuccess } from '@/utils/toast';

interface Category {
  id: string;
  name: string;
  image_url: string;
}

const AdminCategories = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [categoryName, setCategoryName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const getSessionAndCategories = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      } else {
        setSession(session);
        await fetchCategories();
      }
      setLoading(false);
    };
    getSessionAndCategories();
  }, [navigate]);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) {
      showError('Could not fetch categories.');
    } else if (data) {
      setCategories(data);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !editingCategory) {
      showError('Please select an image for the new category.');
      return;
    }
    setIsSubmitting(true);

    let imageUrl = editingCategory?.image_url || '';

    if (imageFile) {
      const filePath = `categories/${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('category_images')
        .upload(filePath, imageFile);

      if (uploadError) {
        showError(`Image upload failed: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('category_images')
        .getPublicUrl(filePath);
      
      imageUrl = urlData.publicUrl;
    }

    let error;
    if (editingCategory) {
      // Update
      ({ error } = await supabase
        .from('categories')
        .update({ name: categoryName, image_url: imageUrl })
        .eq('id', editingCategory.id));
    } else {
      // Insert
      ({ error } = await supabase.from('categories').insert({ name: categoryName, image_url: imageUrl }));
    }
    
    if (error) {
      showError(error.message);
    } else {
      showSuccess(`Category ${editingCategory ? 'updated' : 'added'} successfully!`);
      await fetchCategories();
      setIsDialogOpen(false);
    }
    setIsSubmitting(false);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This cannot be undone.')) return;

    const { error } = await supabase.from('categories').delete().eq('id', categoryId);

    if (error) {
      showError(error.message);
    } else {
      showSuccess('Category deleted.');
      await fetchCategories();
    }
  };

  const openDialog = (category: Category | null) => {
    setEditingCategory(category);
    setCategoryName(category ? category.name : '');
    setImageFile(null);
    setPreviewUrl(category ? category.image_url : null);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-black uppercase">Manage Categories</CardTitle>
            <CardDescription>Add, edit, or delete product categories.</CardDescription>
          </div>
          <Button onClick={() => openDialog(null)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <img src={category.image_url} alt={category.name} className="w-16 h-16 object-cover rounded-md bg-muted" />
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openDialog(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteCategory(category.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit' : 'Add'} Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Image</Label>
                <div className="col-span-3 flex items-center gap-4">
                  <Label htmlFor="picture" className="cursor-pointer shrink-0">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Category preview" className="w-24 h-24 object-cover rounded-md border hover:opacity-80 transition-opacity" />
                    ) : (
                      <div className="w-24 h-24 bg-muted rounded-md flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed hover:border-primary transition-colors">
                        <UploadCloud className="h-8 w-8" />
                        <span className="text-xs mt-1">Upload</span>
                      </div>
                    )}
                  </Label>
                  <Input id="picture" type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                  <span className="text-sm text-muted-foreground truncate">
                    {imageFile ? imageFile.name : 'No file chosen'}
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCategory ? 'Save Changes' : 'Add Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;