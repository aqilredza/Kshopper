// Test the new RPC function
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tdhbuutpolmwxjgzqxtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testRPC() {
  console.log('Testing RPC function...');
  
  // Test the new RPC function
  const { data, error } = await supabase
    .rpc('get_order_items_for_admin', {
      order_id_param: 'ff46ee0e-cfd5-4a50-a310-bf9f998d579f'
    });
  
  console.log('RPC function result:', data, error?.message);
  
  if (data && data.length > 0) {
    console.log('✅ RPC function works!');
    console.log('First item:', {
      id: data[0].id,
      name: data[0].menu_item_name,
      image: data[0].menu_item_image,
      quantity: data[0].quantity,
      price: data[0].price
    });
  }
}

testRPC().catch(console.error);