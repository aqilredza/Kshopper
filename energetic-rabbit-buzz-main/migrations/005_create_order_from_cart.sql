-- Function: create_order_from_cart(user_id UUID)
-- Description: Moves all cart items for a user into a new order and clears the cart. Returns the new order ID.

CREATE OR REPLACE FUNCTION create_order_from_cart()
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_order_id UUID;
  v_total NUMERIC := 0;
BEGIN
  -- Get the current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Calculate total price
  SELECT SUM(ci.quantity * mi.price)
    INTO v_total
    FROM cart_items ci
    JOIN menu_items mi ON ci.menu_item_id = mi.id
    WHERE ci.user_id = v_user_id;

  IF v_total IS NULL THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  -- Create order
  INSERT INTO orders (user_id, total_price, status)
    VALUES (v_user_id, v_total, 'pending')
    RETURNING id INTO v_order_id;

  -- Insert order items
  INSERT INTO order_items (order_id, menu_item_id, quantity, price)
    SELECT v_order_id, ci.menu_item_id, ci.quantity, mi.price
    FROM cart_items ci
    JOIN menu_items mi ON ci.menu_item_id = mi.id
    WHERE ci.user_id = v_user_id;

  -- Clear cart
  DELETE FROM cart_items WHERE user_id = v_user_id;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
