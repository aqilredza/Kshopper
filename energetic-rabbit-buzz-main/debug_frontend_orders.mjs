// Frontend debug script to check what's happening with order items
// Run this in the browser console after logging in as admin

async function debugFrontendOrders() {
  try {
    // Import supabase (this might vary depending on your setup)
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
    
    // Fetch orders (as admin)
    console.log('\n=== FETCHING ORDERS ===');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, user_id, total_price, status, created_at')
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (ordersError) {
      console.log('❌ Error fetching orders:', ordersError);
      return;
    }
    
    console.log('✅ Found', orders.length, 'orders:');
    console.log(orders);
    
    // For each order, check order items
    for (const order of orders) {
      console.log(`\n=== CHECKING ORDER ${order.id} ===`);
      
      // Try to get order items with menu item details
      console.log('Fetching order items with menu item details...');
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('id, order_id, menu_item_id, quantity, price, menu_items(name, image_url)')
        .eq('order_id', order.id);
      
      if (itemsError) {
        console.log('❌ Error fetching order items with join:', itemsError);
        
        // Try without join
        console.log('Trying without join...');
        const { data: simpleItems, error: simpleItemsError } = await supabase
          .from('order_items')
          .select('id, order_id, menu_item_id, quantity, price')
          .eq('order_id', order.id);
        
        console.log('Simple query result:', simpleItems, simpleItemsError);
        
        if (simpleItems && simpleItems.length > 0) {
          console.log('Fetching menu items separately...');
          const menuIds = simpleItems.map(item => item.menu_item_id);
          const { data: menuItems, error: menuError } = await supabase
            .from('menu_items')
            .select('id, name, image_url')
            .in('id', menuIds);
          
          console.log('Menu items:', menuItems, menuError);
        }
      } else {
        console.log('✅ Order items with menu details:', orderItems);
        console.log('📋 Item count:', orderItems.length);
        
        if (orderItems.length > 0) {
          orderItems.forEach((item, index) => {
            console.log(`  Item ${index + 1}:`, {
              id: item.id,
              name: item.menu_items?.name,
              image: item.menu_items?.image_url,
              quantity: item.quantity,
              price: item.price
            });
          });
        }
      }
    }
    
    console.log('\n=== DEBUG COMPLETE ===');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Instructions:
// 1. Log in as admin
// 2. Open browser developer tools (F12)
// 3. Go to Console tab
// 4. Paste this function
// 5. Run: debugFrontendOrders()