import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tdhbuutpolmwxjgzqxtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugOrderItems() {
  console.log('Debugging order items structure...');
  
  // First, let's check if we have any orders at all
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, user_id, total_price')
    .limit(5);
    
  console.log('Sample orders:', orders, ordersError?.message);
  
  // If we have orders, let's check their order items
  if (orders && orders.length > 0) {
    for (const order of orders) {
      console.log(`Checking order items for order ${order.id}...`);
      
      // Try to get order items for this specific order
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);
        
      console.log(`Order ${order.id} items:`, items, itemsError?.message);
      
      // If we have items, let's also check the menu items
      if (items && items.length > 0) {
        const { data: menuItems, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('id', items[0].menu_item_id);
          
        console.log(`Sample menu item for order ${order.id}:`, menuItems?.[0], menuError?.message);
      }
    }
  }
  
  // Let's also check the structure of the order_items table
  const { data: sampleItems, error: sampleError } = await supabase
    .from('order_items')
    .select('*')
    .limit(3);
    
  console.log('Sample order items (any):', sampleItems, sampleError?.message);
}

debugOrderItems().catch(console.error);