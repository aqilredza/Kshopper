// Test script to debug order items fetching
// Run this in the browser console after logging in as admin

async function debugOrderItems() {
  try {
    // Assuming supabase is available globally or can be imported
    const { supabase } = window; // Adjust this based on how supabase is exported in your app
    
    // Or import it directly:
    // import { supabase } from '@/integrations/supabase/client';
    
    console.log('Debugging order items as admin...');
    
    // Check current user
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current user:', session?.user?.email);
    
    // Get all orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, user_id, total_price')
      .limit(5);
    
    console.log('Orders:', orders, ordersError);
    
    if (orders && orders.length > 0) {
      for (const order of orders) {
        console.log(`\n--- Checking order ${order.id} ---`);
        
        // Try to get order items
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('id, order_id, menu_item_id, quantity, price')
          .eq('order_id', order.id);
        
        console.log(`Order items for ${order.id}:`, items, itemsError);
        
        if (items && items.length > 0) {
          // Try to get menu items
          const menuIds = items.map(item => item.menu_item_id);
          const { data: menuItems, error: menuError } = await supabase
            .from('menu_items')
            .select('id, name, image_url')
            .in('id', menuIds);
          
          console.log(`Menu items for order ${order.id}:`, menuItems, menuError);
        }
      }
    }
  } catch (error) {
    console.error('Debug error:', error);
  }
}

// Run the debug function
debugOrderItems();
