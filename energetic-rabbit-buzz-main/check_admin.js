import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tdhbuutpolmwxjgzqxtp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkAdminAndCreatePlatform() {
  console.log('Checking admin status and creating restaurant platform...');
  
  // Check if we're logged in as admin
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Current session:', session?.user?.email);
  
  if (session?.user?.email === 'mredza31@gmail.com') {
    console.log('Logged in as admin, attempting to create restaurant platform...');
    
    // Try to create a restaurant platform
    const { data, error } = await supabase
      .from('restaurant_platforms')
      .insert([{}])
      .select();
    
    console.log('Create restaurant platform result:', data, error);
  } else {
    console.log('Not logged in as admin, cannot create restaurant platform');
  }
  
  // Try to see what restaurant platforms exist
  const { data: platforms, error: platformsError } = await supabase
    .from('restaurant_platforms')
    .select('*');
  
  console.log('Existing restaurant platforms:', platforms, platformsError);
}

checkAdminAndCreatePlatform();