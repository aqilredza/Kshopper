// Debug script to check what's happening with orders and order items
// Run this in the browser console as admin to see what data is available

async function debugOrdersAndItems() {
  try {
    // Access supabase
    const { supabase } = window; // or however supabase is available in your app
    
    if (!supabase) {
      console.log('Supabase client not found.');
      return;
    }
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('Session error:', sessionError);
      return;
    }
    
    if (!session) {
      console.log('Please log in first.');
      return;
    }
    
    console.log('Current user:', session.user.email);
    console.log('Is admin:', session.user.email === 'mredza31@gmail.com');
    
    // Get all orders
    console.log('\n=== FETCHING ALL ORDERS ===');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, user_id, total_price, status, created_at')
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (ordersError) {
      console.log('Error fetching orders:', ordersError);
      return;
    }
    
    console.log('Found', orders.length, 'orders:');
    console.log(orders);
    
    // For each order, check if it has order items
    for (const order of orders) {
      console.log(`\n=== CHECKING ORDER ${order.id} ===`);
      console.log('Order details:', order);
      
      // Try to get order items
      console.log('Fetching order items...');
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('id, order_id, menu_item_id, quantity, price')
        .eq('order_id', order.id);
      
      if (itemsError) {
        console.log('❌ Error fetching order items:', itemsError);
      } else {
        console.log(`✅ Found ${orderItems.length} order items:`);
        console.log(orderItems);
        
        // For each order item, try to get menu item details
        for (const item of orderItems) {
          console.log(`  Checking menu item ${item.menu_item_id}...`);
          const { data: menuItem, error: menuItemError } = await supabase
            .from('menu_items')
            .select('id, name, image_url, price')
            .eq('id', item.menu_item_id)
            .single();
          
          if (menuItemError) {
            console.log(`  ❌ Error fetching menu item:`, menuItemError);
          } else {
            console.log(`  ✅ Menu item found:`, menuItem);
          }
        }
      }
    }
    
    console.log('\n=== DEBUG COMPLETE ===');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run this function in the browser console as admin:
// debugOrdersAndItems();