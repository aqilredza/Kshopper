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

interface HotItem {
  id: string;
  title: string;
  image_url: string;
  menu_item_id: string | null;
}

const ADMIN_EMAIL = "mredza31@gmail.com";

const AdminHotItems = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hotItems, setHotItems] = useState<HotItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HotItem | null>(null);
  
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const getInitialData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email !== ADMIN_EMAIL) {
        navigate('/login');
      } else {
        setSession(session);
        await fetchHotItems();
      }
      setLoading(false);
    };
    getInitialData();
  }, [navigate]);

  const fetchHotItems = async () => {
    const { data, error } = await supabase.from('hot_items').select('*');
    if (error) showError('Could not fetch hot items.');
    else if (data) setHotItems(data);
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
    setIsSubmitting(true);

    let imageUrl = editingItem?.image_url || '';
    if (previewUrl && !previewUrl.startsWith('blob:')) {
        imageUrl = previewUrl;
    }

    if (imageFile) {
      const filePath = `hot-items/${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, imageFile);

      if (uploadError) {
        showError(`Image upload failed: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
      imageUrl = urlData.publicUrl;
    }

    const itemData = {
      title,
      image_url: imageUrl,
      menu_item_id: editingItem?.menu_item_id || null,
    };

    const { error } = editingItem
      ? await supabase.from('hot_items').update(itemData).eq('id', editingItem.id)
      : await supabase.from('hot_items').insert(itemData);
    
    if (error) {
      showError(error.message);
    } else {
      showSuccess(`Hot Item ${editingItem ? 'updated' : 'added'} successfully!`);
      await fetchHotItems();
      setIsDialogOpen(false);
    }
    setIsSubmitting(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    const { error } = await supabase.from('hot_items').delete().eq('id', itemId);
    if (error) showError(error.message);
    else {
      showSuccess('Item deleted.');
      await fetchHotItems();
    }
  };

  const openDialog = (item: HotItem | null) => {
    setEditingItem(item);
    setTitle(item ? item.title : '');
    setImageFile(null);
    setPreviewUrl(item ? item.image_url : null);
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-black uppercase">Manage Hot Items</CardTitle>
            <CardDescription>Add, edit, or delete items on the homepage.</CardDescription>
          </div>
          <Button onClick={() => openDialog(null)}><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell><img src={item.image_url} alt={item.title} className="w-16 h-16 object-cover rounded-md bg-muted" /></TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openDialog(item)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
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
            <DialogHeader><DialogTitle>{editingItem ? 'Edit' : 'Add'} Hot Item</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Image</Label>
                <div className="col-span-3">
                  <Label htmlFor="picture" className="cursor-pointer">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded-md border" />
                    ) : (
                      <div className="w-24 h-24 bg-muted rounded-md flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed"><UploadCloud className="h-8 w-8" /><span className="text-xs mt-1">Upload</span></div>
                    )}
                  </Label>
                  <Input id="picture" type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingItem ? 'Save Changes' : 'Add Item'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHotItems;