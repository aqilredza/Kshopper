// Check what data exists in the database
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tdhbuutpolmwxjgzqxtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkData() {
  console.log('Checking data in tables...');
  
  // Try to access each table directly
  const tables = ['orders', 'order_items', 'cart_items', 'menu_items', 'profiles'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(3);
        
      console.log(`${table}: ${data ? data.length : 0} records`, error?.message);
      
      if (data && data.length > 0) {
        console.log(`Sample ${table} record:`, data[0]);
      }
    } catch (err) {
      console.log(`Error accessing ${table}:`, err.message);
    }
  }
}

checkData().catch(console.error);