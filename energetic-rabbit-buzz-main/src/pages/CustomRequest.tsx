import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { UploadCloud, X } from "lucide-react";

const CustomRequest: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [productDescription, setProductDescription] = useState("");
  const [category, setCategory] = useState("");
  const [productLink, setProductLink] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setImageUrl(null);
      
      // Automatically upload the selected file
      handleAutomaticUpload(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleAutomaticUpload = async (file: File) => {
    if (!session) {
      toast.error("You need to be logged in to upload an image.");
      navigate("/login");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const fileExtension = file.name.split(".").pop();
    const filePath = `${session.user.id}/${Date.now()}.${fileExtension}`;

    console.log("Automatically uploading file to:", filePath);
    const { data, error } = await supabase.storage
      .from("custom_request_images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        onUploadProgress: (event) => {
          if (event.totalBytes) {
            setUploadProgress(Math.round((event.loaded / event.totalBytes) * 100));
          }
        },
      } as any);

    console.log("Automatic upload result:", { data, error });
    if (error) {
      toast.error("Image upload failed: " + error.message);
      setUploading(false);
      setUploadProgress(0);
      setSelectedFile(null);
      return;
    }

    // Generate public URL - using the bucket and file path directly
    const publicUrl = `${supabase.supabaseUrl}/storage/v1/object/public/custom_request_images/${filePath}`;
    
    console.log("Generated public URL:", publicUrl);
    setImageUrl(publicUrl);
    toast.success("Image uploaded successfully!");
    setUploading(false);
    setUploadProgress(0);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImageUrl(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("You need to be logged in to submit a custom request.");
      navigate("/login");
      return;
    }
    if (uploading) {
      toast.error("Please wait for the image to finish uploading.");
      return;
    }

    setIsSubmitting(true);
    // Debug: log the imageUrl before submitting
    console.log("Submitting custom request with imageUrl:", imageUrl);
    const { data, error } = await supabase
      .from("custom_requests")
      .insert({
        user_id: session.user.id,
        product_description: productDescription,
        category: category || null,
        product_link: productLink || null,
        notes: notes || null,
        image_url: imageUrl,
      });

    if (error) {
      toast.error("Failed to submit request: " + error.message);
    } else {
      // Redirect to confirmation page
      navigate("/custom-request-confirmation");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max_w-2xl">
      <h1 className="text-3xl font-bold text-center mb-8">Request a Custom Item</h1>
      <p className="text-center text-gray-600 mb-8">
        Can't find what you're looking for? Tell us about the item you want, and we'll do our best to source it for you!
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="productDescription" className="text-lg">Product Description <span className="text-red-500">*</span></Label>
          <Textarea
            id="productDescription"
            placeholder="e.g., A vintage leather jacket, a specific brand of coffee beans, a rare collectible toy..."
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            required
            rows={4}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="category" className="text-lg">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category" className="w-full mt-2">
              <SelectValue placeholder="Select a category (Optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="fashion">Fashion</SelectItem>
              <SelectItem value="home-goods">Home Goods</SelectItem>
              <SelectItem value="food-beverages">Food & Beverages</SelectItem>
              <SelectItem value="collectibles">Collectibles</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="productLink" className="text-lg">Product Link (Optional)</Label>
          <Input
            id="productLink"
            type="url"
            placeholder="e.g., https://example.com/product-page"
            value={productLink}
            onChange={(e) => setProductLink(e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="imageUpload" className="text-lg">Upload Image (Optional)</Label>
          <div className="mt-2 flex items-center space-x-2">
            <Input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => document.getElementById("imageUpload")?.click()}
              variant="outline"
              className="flex-grow flex items-center justify-center gap-2"
              disabled={uploading}
            >
              <UploadCloud className="h-5 w-5" />
              {selectedFile ? selectedFile.name : "Choose File"}
            </Button>
            {uploading && (
              <Button
                type="button"
                disabled
              >
                Uploading...
              </Button>
            )}
            {imageUrl && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemoveImage}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {uploading && (
            <Progress value={uploadProgress} className="w-full mt-2" />
          )}
          {imageUrl && (
            <p className="text-sm text-green-600 mt-2">Image uploaded: <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="underline">View Image</a></p>
          )}
        </div>

        <div>
          <Label htmlFor="notes" className="text-lg">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any specific details, preferences, or urgency you'd like to add?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-2"
          />
        </div>

        <Button type="submit" className="w-full py-3 text-lg" disabled={isSubmitting || uploading}>
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
      </form>
    </div>
  );
};

export default CustomRequest;