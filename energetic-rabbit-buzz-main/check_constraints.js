import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tdhbuutpolmwxjgzqxtp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkTableConstraints() {
  console.log('Checking table constraints...');
  
  // Try to get information about constraints on menu_items table
  const { data, error } = await supabase
    .from('information_schema.table_constraints')
    .select('*')
    .eq('table_name', 'menu_items')
    .eq('constraint_type', 'FOREIGN KEY');
  
  console.log('Foreign key constraints on menu_items:', data, error);
  
  // Also check column constraints
  const { data: columns, error: columnsError } = await supabase
    .from('information_schema.columns')
    .select('*')
    .eq('table_name', 'menu_items')
    .eq('column_name', 'restaurant_platform_id');
  
  console.log('restaurant_platform_id column info:', columns, columnsError);
}

checkTableConstraints();