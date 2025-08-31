import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tdhbuutpolmwxjgzqxtp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function probeMenuItems() {
  console.log('Probing menu_items table structure...');
  
  // Try to get column information for menu_items
  const commonColumns = ['id', 'name', 'description', 'price', 'image_url', 'category', 'created_at', 'restaurant_platform_id'];
  
  for (const column of commonColumns) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(column)
        .limit(1);
      
      console.log(`Column ${column} exists in menu_items:`, error ? `No - ${error.message}` : 'Yes');
    } catch (e) {
      console.log(`Error checking column ${column} in menu_items:`, e.message);
    }
  }
  
  // Try to understand the relationship between menu_items and restaurant_platforms
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*, restaurant_platforms (*)')
      .limit(1);
    
    console.log('Join with restaurant_platforms:', data, error);
  } catch (e) {
    console.log('Error joining tables:', e.message);
  }
}

probeMenuItems();