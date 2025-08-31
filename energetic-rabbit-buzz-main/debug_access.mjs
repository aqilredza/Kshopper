// Test direct database access with service role key
// This should bypass all RLS policies

// First, let's get the service role key from your Supabase dashboard
// For now, let's try a different approach

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tdhbuutpolmwxjgzqxtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugAccess() {
  console.log('Debugging access to order_items...');
  
  // Let's try to understand what's happening by checking each step
  
  // 1. Check if we can access orders at all
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, user_id, total_price')
    .limit(1);
  
  console.log('Orders access:', orders?.length || 0, ordersError?.message);
  
  // 2. Check if we can access profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .limit(1);
  
  console.log('Profiles access:', profiles?.length || 0, profilesError?.message);
  
  // 3. Try a very simple query on order_items
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('id')
    .limit(1);
  
  console.log('Simple order_items access:', items?.length || 0, itemsError?.message);
  
  // 4. Check if there's a specific issue with joins
  if (items && items.length > 0) {
    console.log('Trying to access specific item:', items[0].id);
    
    const { data: specificItem, error: specificError } = await supabase
      .from('order_items')
      .select('*')
      .eq('id', items[0].id);
    
    console.log('Specific item access:', specificItem?.length || 0, specificError?.message);
  }
}

debugAccess().catch(console.error);