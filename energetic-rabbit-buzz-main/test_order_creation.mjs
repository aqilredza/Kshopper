// Test script to verify order creation and item linking
// Run this in the browser console after logging in as a user

async function testOrderCreation() {
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
    
    console.log('Current user ID:', session.user.id);
    
    // Check if user has items in cart
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('id, menu_item_id, quantity, menu_items(name, price, image_url)')
      .eq('user_id', session.user.id);
    
    console.log('Cart items:', cartItems, cartError);
    
    if (cartError) {
      console.log('Error fetching cart items:', cartError);
      return;
    }
    
    if (!cartItems || cartItems.length === 0) {
      console.log('Cart is empty. Add items to cart first.');
      return;
    }
    
    console.log('Cart contains', cartItems.length, 'items');
    
    // Try to create order using the function
    console.log('Creating order...');
    const { data: orderId, error: orderError } = await supabase.rpc('create_order_from_cart');
    
    if (orderError) {
      console.log('Error creating order:', orderError);
      return;
    }
    
    console.log('Order created successfully with ID:', orderId);
    
    // Check if order was created
    const { data: order, error: getOrderError } = await supabase
      .from('orders')
      .select('id, user_id, total_price, status')
      .eq('id', orderId)
      .single();
    
    console.log('Order details:', order, getOrderError);
    
    // Check if order items were created
    const { data: orderItems, error: getOrderItemsError } = await supabase
      .from('order_items')
      .select('id, order_id, menu_item_id, quantity, price, menu_items(name, image_url)')
      .eq('order_id', orderId);
    
    console.log('Order items:', orderItems, getOrderItemsError);
    
    if (orderItems && orderItems.length > 0) {
      console.log('✅ SUCCESS: Order items created successfully!');
      console.log('📋 Order ID:', orderId);
      console.log('🛍️ Number of items:', orderItems.length);
      orderItems.forEach((item, index) => {
        console.log(`  Item ${index + 1}:`, {
          name: item.menu_items?.name,
          image: item.menu_items?.image_url,
          quantity: item.quantity,
          price: item.price
        });
      });
    } else {
      console.log('❌ ISSUE: Order created but no order items found.');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Instructions:
// 1. Add items to your cart as a regular user
// 2. Open browser developer tools (F12)
// 3. Go to Console tab
// 4. Paste this function
// 5. Run: testOrderCreation()