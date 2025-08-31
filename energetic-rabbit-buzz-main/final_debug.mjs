// Test with a completely different approach - try to access the data we know exists
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tdhbuutpolmwxjgzqxtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function finalDebug() {
  console.log('Final debug test...');
  
  // Try to access the specific order item we know exists
  // Using the exact IDs from our earlier SQL queries
  try {
    // First, let's verify we can access orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, user_id, total_price, status')
      .eq('id', 'ff46ee0e-cfd5-4a50-a310-bf9f998d579f');
    
    console.log('Orders access test:', orders, ordersError?.message);
    
    // Now try to access order_items for that specific order
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('id, order_id, menu_item_id, quantity, price')
      .eq('order_id', 'ff46ee0e-cfd5-4a50-a310-bf9f998d579f');
    
    console.log('Order items access test:', orderItems, itemsError?.message);
    
    // If we got items, try to get menu item details
    if (orderItems && orderItems.length > 0) {
      const menuItemId = orderItems[0].menu_item_id;
      console.log('Fetching menu item:', menuItemId);
      
      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('id, name, image_url')
        .eq('id', menuItemId);
      
      console.log('Menu items access test:', menuItems, menuError?.message);
    }
    
  } catch (error) {
    console.log('Exception in final debug:', error);
  }
}

finalDebug().catch(console.error);