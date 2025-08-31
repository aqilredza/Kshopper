// Test the simple admin function
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tdhbuutpolmwxjgzqxtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSimpleFunction() {
  console.log('Testing simple admin function...');
  
  // Test the function for a specific order
  const { data: orderItems, error: orderItemsError } = await supabase
    .rpc('admin_get_order_items', {
      target_order_id: 'ff46ee0e-cfd5-4a50-a310-bf9f998d579f'
    });
  
  console.log('Simple function result:', orderItems, orderItemsError?.message);
  
  if (orderItems && orderItems.length > 0) {
    console.log('✅ Simple function works!');
    console.log('Sample item:', {
      id: orderItems[0].item_id,
      name: orderItems[0].item_name,
      image: orderItems[0].item_image,
      quantity: orderItems[0].item_qty,
      price: orderItems[0].item_price
    });
  }
}

testSimpleFunction().catch(console.error);