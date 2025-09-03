import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { showError, showSuccess } from '@/utils/toast';
import { Upload, X } from 'lucide-react';

const ADMIN_EMAIL = "mredza31@gmail.com";

const AdminAboutPage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }

    if (session.user.email !== ADMIN_EMAIL) {
      navigate('/');
      return;
    }

    fetchAdminProfile();
  }, [session, navigate]);

  const fetchAdminProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user.id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setAdminProfile(data);
        setFullName(data.full_name || '');
        setAvatarUrl(data.avatar_url || '');
        const defaultDescription = "Hey there! 👋 I'm Redza, your new go-to style guru and personal shopper.\n\nTired of endless scrolling? I'm here to do the heavy lifting! I'll handpick pieces you'll absolutely love, spill the tea on the latest trends, and make sure your look is always on point. 🔥\n\nReady to unlock your best style? Let's chat! Slide into my WhatsApp and we'll get started.";
        setDescription(data.description || defaultDescription);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true);
      const fileExtension = file.name.split('.').pop();
      const filePath = `avatars/${session?.user.id}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setAvatarUrl('');
  };

  const handleSave = async () => {
    if (!session) return;

    setSaving(true);
    try {
      let avatarUrlToSave = avatarUrl;

      // Upload new avatar if selected
      if (selectedFile) {
        avatarUrlToSave = await uploadAvatar(selectedFile);
      }

      console.log('Updating profile with data:', {
        full_name: fullName,
        avatar_url: avatarUrlToSave,
        description: description,
        user_id: session.user.id
      });

      // Try to update using RPC function first (safer approach)
      const { error: rpcError } = await supabase
        .rpc('update_admin_profile', {
          p_full_name: fullName,
          p_avatar_url: avatarUrlToSave,
          p_description: description
        });

      if (rpcError) {
        console.warn('RPC update failed, trying direct update:', rpcError);
        // Fallback to direct update
        const { error: profileError, data } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            avatar_url: avatarUrlToSave,
            description: description,
            is_admin: true,
          })
          .eq('id', session.user.id);

        if (profileError) {
          console.error('Profile update error details:', profileError);
          throw new Error(`Failed to update profile: ${profileError.message}`);
        }

        console.log('Profile update successful:', data);
      } else {
        console.log('Profile update via RPC successful');
      }

      showSuccess('Profile updated successfully!');
      setSelectedFile(null);
      fetchAdminProfile(); // Refresh data
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showError(`Failed to update profile: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase">Edit About Page</h1>
        <Button onClick={() => navigate('/admin')}>
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label>Profile Image</Label>
              <div className="mt-2 flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {avatarUrl || selectedFile ? (
                    <div className="relative">
                      <img
                        src={selectedFile ? URL.createObjectURL(selectedFile) : avatarUrl}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-200 border-2 border-dashed rounded-full w-24 h-24 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Label htmlFor="avatar-upload">
                    <Button asChild variant="outline" className="cursor-pointer">
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        {selectedFile ? 'Change Image' : 'Upload Image'}
                      </span>
                    </Button>
                  </Label>
                  {selectedFile && (
                    <p className="text-sm text-gray-500 mt-2">
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter your description"
                rows={12}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-red-50 to-white rounded-2xl shadow-lg p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                {(avatarUrl || selectedFile) ? (
                  <img
                    src={selectedFile ? URL.createObjectURL(selectedFile) : avatarUrl}
                    alt="Profile"
                    className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-full w-48 h-48 flex items-center justify-center text-gray-400">
                    Profile Image
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-4">Meet Your Style Guru</h2>
                <div className="whitespace-pre-line text-gray-700 mb-6">
                  {description}
                </div>
                
                <div className="bg-red-50 rounded-lg p-6 border border-red-100">
                  <h3 className="font-bold text-lg mb-3 text-red-800">Hit me up:</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <span className="font-medium">WhatsApp: +60 17-612 5413</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <span className="font-medium">Email: mredza31@gmail.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} disabled={saving || uploading}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminAboutPage;