import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tdhbuutpolmwxjgzqxtp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function deleteCustomRequests() {
  const startDate = new Date('2025-08-24T00:00:00Z');
  const endDate = new Date('2025-08-25T23:59:59Z');
  
  console.log('Deleting custom requests from', startDate.toISOString(), 'to', endDate.toISOString());
  
  try {
    // First, let's see what would be deleted
    const { data: requestsToDelete, error: selectError } = await supabase
      .from('custom_requests')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    if (selectError) {
      console.error('Error fetching requests:', selectError);
      return;
    }
    
    console.log(`Found ${requestsToDelete.length} requests to delete:`);
    requestsToDelete.forEach(request => {
      console.log(`- ID: ${request.id}, Date: ${request.created_at}, Description: ${request.product_description}`);
    });
    
    if (requestsToDelete.length === 0) {
      console.log('No requests found in the specified date range.');
      return;
    }
    
    // Perform the deletion using soft delete (updating status to 'deleted')
    const { data, error } = await supabase
      .from('custom_requests')
      .update({ status: 'deleted' })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    if (error) {
      console.error('Error deleting requests:', error);
    } else {
      console.log(`Successfully marked ${requestsToDelete.length} requests as deleted.`);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

deleteCustomRequests();