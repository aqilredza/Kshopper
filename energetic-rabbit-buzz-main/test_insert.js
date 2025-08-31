import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tdhbuutpolmwxjgzqxtp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testInsert() {
  console.log('Testing insert into restaurant_platforms...');
  
  // Try to insert a minimal record to see what columns are required
  const { data, error } = await supabase
    .from('restaurant_platforms')
    .insert([
      {
        name: 'Test Product',
        price: 10.99
      }
    ])
    .select();
  
  console.log('Insert result:', data, error);
  
  // Also try to select a record to see the structure
  const { data: selectData, error: selectError } = await supabase
    .from('restaurant_platforms')
    .select('*')
    .limit(1);
  
  console.log('Select result:', selectData, selectError);
}

testInsert();