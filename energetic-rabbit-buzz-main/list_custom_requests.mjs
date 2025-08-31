import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tdhbuutpolmwxjgzqxtp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function listCustomRequests() {
  try {
    // Fetch all custom requests
    const { data: requests, error } = await supabase
      .from('custom_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error('Error fetching requests:', error);
      return;
    }
    
    console.log(`Found ${requests.length} most recent requests:`);
    requests.forEach(request => {
      console.log(`- ID: ${request.id}, Date: ${request.created_at}, Status: ${request.status}, Description: ${request.product_description.substring(0, 50)}...`);
    });
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

listCustomRequests();