// Comprehensive test script to create a complete order with items
// This script will create a test order with multiple items that you can view as admin

async function createCompleteTestOrder() {
  try {
    // Access supabase (this might vary depending on your setup)
    // If this doesn't work, you might need to import it differently
    const { supabase } = window; // or however supabase is available in your app
    
    if (!supabase) {
      console.log('Supabase client not found. Make sure you run this after the app has loaded.');
      return;
    }
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('Session error:', sessionError);
      return;
    }
    
    if (!session) {
      console.log('Please log in first before running this script.');
      return;
    }
    
    console.log('Current user ID:', session.user.id);
    
    // Get multiple menu items to create a more realistic order
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, price, name, image_url')
      .limit(3);
    
    if (menuError) {
      console.log('Error fetching menu items:', menuError);
      return;
    }
    
    if (!menuItems || menuItems.length === 0) {
      console.log('No menu items found in the database.');
      return;
    }
    
    console.log('Found menu items:', menuItems);
    
    // Calculate total price
    let totalPrice = 0;
    menuItems.forEach(item => {
      totalPrice += item.price * 2; // 2 quantity of each item
    });
    
    console.log('Total order price:', totalPrice);
    
    // Create a test order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.id,
        total_price: totalPrice,
        status: 'pending'
      })
      .select()
      .single();
    
    if (orderError) {
      console.log('Error creating order:', orderError);
      return;
    }
    
    console.log('Created order:', order);
    
    // Create multiple order items
    const orderItemsToInsert = menuItems.map((item, index) => ({
      order_id: order.id,
      menu_item_id: item.id,
      quantity: 2, // 2 of each item
      price: item.price
    }));
    
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert)
      .select();
    
    if (itemsError) {
      console.log('Error creating order items:', itemsError);
      return;
    }
    
    console.log('Created order items:', orderItems);
    console.log('✅ Test order created successfully!');
    console.log('📋 Order ID:', order.id);
    console.log('💰 Total price: MYR', totalPrice.toFixed(2));
    console.log('🛍️ Number of items:', orderItems.length);
    console.log('');
    console.log('Now log in as admin and refresh the manage orders page to see this order.');
    console.log('Click "View Items" to see the detailed items with images.');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Instructions:
// 1. Log in as any user (not admin)
// 2. Open browser developer tools (F12)
// 3. Go to Console tab
// 4. Paste this entire function
// 5. Run: createCompleteTestOrder()

console.log('Function created. Run createCompleteTestOrder() to create a test order.');