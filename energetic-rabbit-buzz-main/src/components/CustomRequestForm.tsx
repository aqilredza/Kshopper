import React from "react";

const CustomRequestForm = () => (
  <form className="space-y-6">
    <h2 className="text-2xl font-bold mb-4">Request Your Items</h2>
    <div>
      <label className="font-semibold">Item Category</label>
      <input className="w-full border rounded px-3 py-2 mt-1" placeholder="Korea University Hoodie / K-Pop Album Collection / Official Kpop Merchandise" />
    </div>
    <div>
      <label className="font-semibold">Specific Items Wanted</label>
      <textarea className="w-full border rounded px-3 py-2 mt-1" rows={3} placeholder="List items here..." />
    </div>
    <div>
      <label className="font-semibold">Size/Specifications</label>
      <textarea className="w-full border rounded px-3 py-2 mt-1" rows={2} placeholder="Sizes, colors, models, etc." />
    </div>
    <div className="flex gap-4">
      <div className="flex-1">
        <label className="font-semibold">Quantity</label>
        <input className="w-full border rounded px-3 py-2 mt-1" placeholder="How many of each item" />
      </div>
      <div className="flex-1">
        <label className="font-semibold">Budget Range</label>
        <div className="flex gap-2">
          <input className="w-full border rounded px-3 py-2 mt-1" placeholder="Min $" />
          <input className="w-full border rounded px-3 py-2 mt-1" placeholder="Max $" />
        </div>
      </div>
    </div>
    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">Submit Request</button>
  </form>
);

export default CustomRequestForm;
