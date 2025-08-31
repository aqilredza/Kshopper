// Simple debug script to check order items
// Save this as debug_orders.mjs and run with: node debug_orders.mjs

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tdhbuutpolmwxjgzqxtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugOrders() {
  console.log('Debugging orders and order items...');
  
  // Check orders
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, user_id, total_price, status, created_at')
    .limit(5);
  
  console.log('Orders:', orders, ordersError);
  
  if (orders && orders.length > 0) {
    for (const order of orders) {
      console.log(`\nChecking order ${order.id}...`);
      
      // Check order items
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('id, order_id, menu_item_id, quantity, price')
        .eq('order_id', order.id);
      
      console.log(`Order items for ${order.id}:`, orderItems, itemsError);
      
      if (orderItems && orderItems.length > 0) {
        // Check menu items
        const menuIds = orderItems.map(item => item.menu_item_id);
        const { data: menuItems, error: menuError } = await supabase
          .from('menu_items')
          .select('id, name, image_url')
          .in('id', menuIds);
        
        console.log(`Menu items for order ${order.id}:`, menuItems, menuError);
      }
    }
  }
  
  // Check table counts
  const tables = ['orders', 'order_items', 'cart_items', 'menu_items'];
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('count()', { count: 'exact' });
    
    console.log(`${table} count:`, data?.length || 0, error?.message);
  }
}

debugOrders().catch(console.error);