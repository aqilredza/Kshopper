// Ultimate test - try to access data with service key
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tdhbuutpolmwxjgzqxtp.supabase.co';

// Try with anon key first
const supabaseAnon = createClient(
  SUPABASE_URL, 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc'
);

async function ultimateTest() {
  console.log('Ultimate test to access order items...');
  
  // Check if we can access the count
  const { count, error: countError } = await supabaseAnon
    .from('order_items')
    .select('*', { count: 'exact', head: true });
  
  console.log('Count test:', count, countError?.message);
  
  // Try direct access to the specific item we know exists
  const { data: directData, error: directError } = await supabaseAnon
    .from('order_items')
    .select('*')
    .eq('id', 'ab5f4fd4-4bea-4eef-88e3-d6de014bc44a');
  
  console.log('Direct access test:', directData, directError?.message);
  
  // Try to see what's in the table at all
  const { data: allData, error: allError } = await supabaseAnon
    .from('order_items')
    .select('id, order_id, menu_item_id')
    .limit(5);
  
  console.log('All data test:', allData, allError?.message);
}

ultimateTest().catch(console.error);