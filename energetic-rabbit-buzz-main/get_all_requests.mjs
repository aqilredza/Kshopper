import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tdhbuutpolmwxjgzqxtp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function getAllCustomRequests() {
  try {
    // Fetch all custom requests without any filters
    const { data: requests, error } = await supabase
      .from('custom_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching requests:', error);
      return;
    }
    
    console.log(`Found ${requests.length} total requests:`);
    if (requests.length > 0) {
      requests.forEach((request, index) => {
        if (index < 10) { // Only show first 10 to avoid too much output
          console.log(`- ID: ${request.id}, Date: ${request.created_at}, Status: ${request.status}, Description: ${request.product_description ? request.product_description.substring(0, 50) + '...' : 'N/A'}`);
        }
      });
      if (requests.length > 10) {
        console.log(`... and ${requests.length - 10} more requests.`);
      }
    } else {
      console.log('No requests found in the database.');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

getAllCustomRequests();