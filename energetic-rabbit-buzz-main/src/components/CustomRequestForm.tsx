
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CustomRequestForm = () => {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [specs, setSpecs] = useState("");
  const [quantity, setQuantity] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      console.log("Selected file:", e.target.files[0]);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    let imageUrl = null;

    if (file) {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `custom_requests/${Date.now()}.${fileExt}`;
      console.log("Uploading file to:", filePath);
      const { error: uploadError } = await supabase.storage
        .from("custom_request_images")
        .upload(filePath, file);
      setUploading(false);
      console.log("Upload error:", uploadError);
      if (uploadError) {
        setError("Image upload failed: " + uploadError.message);
        return;
      }
      const { data: publicUrlData } = supabase.storage
        .from("custom_request_images")
        .getPublicUrl(filePath);
      console.log("Public URL data:", publicUrlData);
      imageUrl = publicUrlData?.publicUrl;
    }

    // Save the request to your DB (replace with your actual insert logic)
    const { error: dbError } = await supabase.from("custom_requests").insert({
      product_description: description,
      category,
      notes: specs,
      quantity,
      budget_min: budgetMin,
      budget_max: budgetMax,
      image_url: imageUrl,
    });
    if (dbError) {
      setError("Failed to submit request: " + dbError.message);
    } else {
      alert("Request submitted successfully!");
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4">Request Your Items</h2>
      <div>
        <label className="font-semibold">Item Category</label>
        <input className="w-full border rounded px-3 py-2 mt-1" value={category} onChange={e => setCategory(e.target.value)} placeholder="Korea University Hoodie / K-Pop Album Collection / Official Kpop Merchandise" />
      </div>
      <div>
        <label className="font-semibold">Specific Items Wanted</label>
        <textarea className="w-full border rounded px-3 py-2 mt-1" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="List items here..." />
      </div>
      <div>
        <label className="font-semibold">Size/Specifications</label>
        <textarea className="w-full border rounded px-3 py-2 mt-1" rows={2} value={specs} onChange={e => setSpecs(e.target.value)} placeholder="Sizes, colors, models, etc." />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="font-semibold">Quantity</label>
          <input className="w-full border rounded px-3 py-2 mt-1" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="How many of each item" />
        </div>
        <div className="flex-1">
          <label className="font-semibold">Budget Range</label>
          <div className="flex gap-2">
            <input className="w-full border rounded px-3 py-2 mt-1" value={budgetMin} onChange={e => setBudgetMin(e.target.value)} placeholder="Min $" />
            <input className="w-full border rounded px-3 py-2 mt-1" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} placeholder="Max $" />
          </div>
        </div>
      </div>
      <div>
        <label className="font-semibold">Upload Image</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {uploading && <p>Uploading...</p>}
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">Submit Request</button>
    </form>
  );
};

export default CustomRequestForm;
