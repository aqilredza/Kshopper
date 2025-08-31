import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tdhbuutpolmwxjgzqxtp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkExistingPlatforms() {
  console.log('Checking existing restaurant platforms...');
  
  // Try to see what restaurant platforms exist
  const { data: platforms, error: platformsError } = await supabase
    .from('restaurant_platforms')
    .select('*');
  
  console.log('Existing restaurant platforms:', platforms, platformsError);
  
  // Also check a sample menu item to see what restaurant_platform_id it has
  const { data: menuItems, error: menuItemsError } = await supabase
    .from('menu_items')
    .select('*')
    .limit(1);
  
  console.log('Sample menu item:', menuItems, menuItemsError);
}

checkExistingPlatforms();