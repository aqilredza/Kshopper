// Test the new RPC functions
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tdhbuutpolmwxjgzqxtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testRPCFunctions() {
  console.log('Testing new RPC functions...');
  
  // Test the function for a specific order
  const { data: orderItems, error: orderItemsError } = await supabase
    .rpc('get_order_items_for_order', {
      order_id_param: 'ff46ee0e-cfd5-4a50-a310-bf9f998d579f'
    });
  
  console.log('Order items RPC result:', orderItems, orderItemsError?.message);
  
  if (orderItems && orderItems.length > 0) {
    console.log('✅ RPC function works!');
    console.log('Sample item:', {
      id: orderItems[0].order_item_id,
      name: orderItems[0].menu_item_name,
      image: orderItems[0].menu_item_image,
      quantity: orderItems[0].order_item_quantity,
      price: orderItems[0].order_item_price
    });
  }
}

testRPCFunctions().catch(console.error);