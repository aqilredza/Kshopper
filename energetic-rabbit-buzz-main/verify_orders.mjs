// Verify that orders and order items were created
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tdhbuutpolmwxjgzqxtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyOrders() {
  console.log('Checking for newly created orders...');
  
  // Check orders
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
    
  console.log('Orders found:', orders?.length || 0, ordersError?.message);
  
  if (orders && orders.length > 0) {
    for (const order of orders) {
      console.log(`\nOrder ${order.id}:`);
      console.log('  User ID:', order.user_id);
      console.log('  Total Price:', order.total_price);
      console.log('  Status:', order.status);
      console.log('  Created:', order.created_at);
      
      // Check order items
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('id, order_id, menu_item_id, quantity, price')
        .eq('order_id', order.id);
        
      console.log('  Order items:', orderItems?.length || 0, itemsError?.message);
      
      if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          console.log(`    Item ${item.id}:`);
          console.log(`      Menu Item ID: ${item.menu_item_id}`);
          console.log(`      Quantity: ${item.quantity}`);
          console.log(`      Price: ${item.price}`);
        }
      }
    }
  } else {
    console.log('No orders found. Please complete the checkout process first.');
  }
}

verifyOrders().catch(console.error);