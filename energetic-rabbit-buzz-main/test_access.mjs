// Test script to verify access to order items
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tdhbuutpolmwxjgzqxtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc';

// Use anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAccess() {
  console.log('Testing access to order items...');
  
  // Try to access the specific order item we know exists
  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select(`
      id,
      order_id,
      menu_item_id,
      quantity,
      price
    `)
    .eq('order_id', 'ff46ee0e-cfd5-4a50-a310-bf9f998d579f');
  
  console.log('Order items access test:', orderItems, itemsError?.message);
  
  if (orderItems && orderItems.length > 0) {
    console.log('✅ Can access order items');
    console.log('First item details:', {
      id: orderItems[0].id,
      order_id: orderItems[0].order_id,
      menu_item_id: orderItems[0].menu_item_id,
      quantity: orderItems[0].quantity,
      price: orderItems[0].price
    });
    
    // Try to get menu item details
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, image_url')
      .eq('id', orderItems[0].menu_item_id);
    
    console.log('Menu items access test:', menuItems, menuError?.message);
    
    if (menuItems && menuItems.length > 0) {
      console.log('✅ Can access menu items');
      console.log('Menu item details:', {
        id: menuItems[0].id,
        name: menuItems[0].name,
        image: menuItems[0].image_url
      });
    }
  } else {
    console.log('❌ Cannot access order items');
  }
}

testAccess().catch(console.error);