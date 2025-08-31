// Direct test to see if we can access any order item data
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tdhbuutpolmwxjgzqxtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function directTest() {
  console.log('Direct test to access order item data...');
  
  // Try to access the specific order item we know exists
  try {
    // First, try to get the count of order items
    const { count, error: countError } = await supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true });
    
    console.log('Order items count:', count, countError?.message);
    
    // Try to get all order items (this might fail due to policies)
    const { data: allItems, error: allError } = await supabase
      .from('order_items')
      .select('id, order_id, menu_item_id, quantity, price');
    
    console.log('All order items:', allItems?.length || 0, allError?.message);
    
    // Try to get menu items
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, image_url');
    
    console.log('Menu items:', menuItems?.length || 0, menuError?.message);
    
    if (menuItems && menuItems.length > 0) {
      console.log('Sample menu item:', menuItems[0]);
    }
    
  } catch (error) {
    console.log('Exception in direct test:', error);
  }
}

directTest().catch(console.error);