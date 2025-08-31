import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tdhbuutpolmwxjgzqxtp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function probeRestaurantPlatforms() {
  console.log('Probing restaurant_platforms table structure...');
  
  // Try inserting with just an id to see what's required
  try {
    const { data, error } = await supabase
      .from('restaurant_platforms')
      .insert([{}])
      .select();
    
    console.log('Insert with empty object:', data, error);
  } catch (e) {
    console.log('Error with empty insert:', e.message);
  }
  
  // Try to get column information through a different approach
  try {
    // Try to get a list of columns by attempting to select specific ones
    const commonColumns = ['id', 'name', 'description', 'price', 'image_url', 'category', 'created_at'];
    
    for (const column of commonColumns) {
      try {
        const { data, error } = await supabase
          .from('restaurant_platforms')
          .select(column)
          .limit(1);
        
        console.log(`Column ${column} exists:`, error ? `No - ${error.message}` : 'Yes');
      } catch (e) {
        console.log(`Error checking column ${column}:`, e.message);
      }
    }
  } catch (e) {
    console.log('Error probing columns:', e.message);
  }
}

probeRestaurantPlatforms();