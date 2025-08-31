import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tdhbuutpolmwxjgzqxtp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkStructure() {
  console.log('Checking database structure...');
  
  // Check restaurant_platforms table structure
  const { data: platforms, error: platformsError } = await supabase
    .from('restaurant_platforms')
    .select('*')
    .limit(1);
  
  console.log('Restaurant Platforms sample:', platforms, platformsError);
  
  // Check menu_items table structure
  const { data: menuItems, error: menuError } = await supabase
    .from('menu_items')
    .select('*')
    .limit(1);
  
  console.log('Menu Items sample:', menuItems, menuError);
  
  // Check table structure for menu_items
  const { data: menuColumns, error: columnsError } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_name', 'menu_items');
  
  console.log('Menu Items columns:', menuColumns, columnsError);
  
  // Check if restaurant_platforms table exists
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'restaurant_platforms');
    
  console.log('Restaurant Platforms table exists:', tables, tablesError);
}

checkStructure();