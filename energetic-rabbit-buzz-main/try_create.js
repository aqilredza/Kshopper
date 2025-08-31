import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tdhbuutpolmwxjgzqxtp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function tryCreateMinimalPlatform() {
  console.log('Attempting to create minimal restaurant platform...');
  
  // Try to create a minimal restaurant platform with just an ID
  const { data, error } = await supabase
    .from('restaurant_platforms')
    .insert([{}])
    .select('id');
  
  console.log('Create minimal platform result:', data, error);
  
  // If that fails, try with some basic fields
  if (error) {
    console.log('Trying with basic fields...');
    const { data: data2, error: error2 } = await supabase
      .from('restaurant_platforms')
      .insert([{ name: 'Default Platform' }])
      .select('id');
    
    console.log('Create platform with name result:', data2, error2);
  }
}

tryCreateMinimalPlatform();