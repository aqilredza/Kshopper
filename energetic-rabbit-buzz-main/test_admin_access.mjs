// Test script to verify admin can access order items
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tdhbuutpolmwxjgzqxtp.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE1MTY2NCwiZXhwIjoyMDcwNzI3NjY0fQ.5_9LI7vGZ9FzO0X9vJ9X0X9vJ9X0X9vJ9X0X9vJ9X0X';

// Use service key for full access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testAdminAccess() {
  console.log('Testing admin access to order items...');
  
  // Try to access the specific order item we know exists
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
  
  console.log('Order items with admin access:', orderItems, itemsError?.message);
  
  if (orderItems && orderItems.length > 0) {
    console.log('✅ Admin can access order items successfully');
    console.log('First item details:', {
      id: orderItems[0].id,
      name: orderItems[0].menu_items?.name,
      image: orderItems[0].menu_items?.image_url,
      quantity: orderItems[0].quantity,
      price: orderItems[0].price
    });
  } else {
    console.log('❌ Admin cannot access order items');
  }
}

testAdminAccess().catch(console.error);