// Test script to create a sample order with items for debugging
// Run this in the browser console after logging in as any user

async function createTestOrderWithItems() {
  try {
    // Import supabase (adjust based on your project structure)
    const { supabase } = window; // or however you access supabase in your app
    
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('Please log in first');
      return;
    }
    
    console.log('Current user:', session.user.id);
    
    // Get a sample menu item
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, price, name, image_url')
      .limit(1);
    
    if (menuError) {
      console.log('Error fetching menu items:', menuError);
      return;
    }
    
    if (!menuItems || menuItems.length === 0) {
      console.log('No menu items found');
      return;
    }
    
    const menuItem = menuItems[0];
    console.log('Using menu item:', menuItem);
    
    // Create a test order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.id,
        total_price: menuItem.price,
        status: 'pending'
      })
      .select()
      .single();
    
    if (orderError) {
      console.log('Error creating order:', orderError);
      return;
    }
    
    console.log('Created order:', order);
    
    // Create order items
    const { data: orderItem, error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        menu_item_id: menuItem.id,
        quantity: 2,
        price: menuItem.price
      })
      .select()
      .single();
    
    if (itemError) {
      console.log('Error creating order item:', itemError);
      return;
    }
    
    console.log('Created order item:', orderItem);
    console.log('Test order created successfully!');
    console.log('Order ID:', order.id);
    console.log('Refresh the admin manage orders page to see this order');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// To run this function, paste it in the browser console and call:
// createTestOrderWithItems();