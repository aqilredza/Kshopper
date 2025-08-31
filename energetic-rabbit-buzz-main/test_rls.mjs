// Test if RLS policies are working
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tdhbuutpolmwxjgzqxtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testRLS() {
  console.log('Testing RLS policies...');
  
  // Test 1: Simple order_items access
  const { data: test1, error: error1 } = await supabase
    .from('order_items')
    .select('id, order_id, menu_item_id')
    .limit(1);
  
  console.log('Test 1 - Simple order_items access:', test1?.length || 0, error1?.message);
  
  // Test 2: Access specific order items
  const { data: test2, error: error2 } = await supabase
    .from('order_items')
    .select('id, order_id, menu_item_id, quantity, price')
    .eq('order_id', 'ff46ee0e-cfd5-4a50-a310-bf9f998d579f');
  
  console.log('Test 2 - Specific order items:', test2?.length || 0, error2?.message);
  
  // Test 3: Menu items access
  const { data: test3, error: error3 } = await supabase
    .from('menu_items')
    .select('id, name, image_url')
    .limit(1);
  
  console.log('Test 3 - Menu items access:', test3?.length || 0, error3?.message);
}

testRLS().catch(console.error);