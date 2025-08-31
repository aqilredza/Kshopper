// Test the exact query used by the frontend
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tdhbuutpolmwxjgzqxtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testExactQuery() {
  console.log('Testing the exact query used by frontend...');
  
  // This is the exact query from the frontend code
  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select(`
      id,
      order_id,
      menu_item_id,
      quantity,
      price,
      menu_items (
        name,
        image_url
      )
    `)
    .eq('order_id', 'ff46ee0e-cfd5-4a50-a310-bf9f998d579f');
  
  console.log('Exact frontend query result:', orderItems, itemsError?.message);
  
  if (itemsError) {
    // Try simplified query
    console.log('Trying simplified query...');
    const { data: simpleItems, error: simpleError } = await supabase
      .from('order_items')
      .select('id, order_id, menu_item_id, quantity, price')
      .eq('order_id', 'ff46ee0e-cfd5-4a50-a310-bf9f998d579f');
    
    console.log('Simplified query result:', simpleItems, simpleError?.message);
    
    if (simpleItems && simpleItems.length > 0) {
      console.log('Fetching menu items separately...');
      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('id, name, image_url')
        .eq('id', simpleItems[0].menu_item_id);
      
      console.log('Menu items result:', menuItems, menuError?.message);
    }
  }
}

testExactQuery().catch(console.error);