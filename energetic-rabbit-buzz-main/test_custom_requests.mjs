import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tdhbuutpolmwxjgzqxtp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCustomRequests() {
  console.log('Testing custom requests table...');
  
  // First, try to authenticate as admin
  const { data: session, error: sessionError } = await supabase.auth.getSession();
  console.log('Session:', session, sessionError);
  
  // Try to get all requests
  const { data: requests, error: fetchError } = await supabase
    .from('custom_requests')
    .select('*')
    .limit(5);
  
  if (fetchError) {
    console.error('Error fetching requests:', fetchError);
    return;
  }
  
  console.log('Requests found:', requests?.length || 0);
  if (requests && requests.length > 0) {
    console.log('First request:', requests[0]);
    
    // Try to update the first request
    const requestId = requests[0].id;
    const originalStatus = requests[0].status;
    console.log('Original status:', originalStatus);
    
    console.log('Attempting to update status...');
    const { data: updated, error: updateError } = await supabase
      .from('custom_requests')
      .update({ status: 'approved' })
      .eq('id', requestId)
      .select();
    
    if (updateError) {
      console.error('Error updating request:', updateError);
      return;
    }
    
    console.log('Update result:', updated);
    
    // Now fetch it again to see if it was actually updated
    console.log('Fetching updated request...');
    const { data: refetched, error: refetchError } = await supabase
      .from('custom_requests')
      .select('*')
      .eq('id', requestId)
      .single();
    
    if (refetchError) {
      console.error('Error refetching request:', refetchError);
      return;
    }
    
    console.log('Refetched request:', refetched);
    console.log('Status after update:', refetched.status);
    console.log('Expected: approved, Got:', refetched.status);
  } else {
    console.log('No requests found in database');
  }
}

testCustomRequests().catch(console.error);