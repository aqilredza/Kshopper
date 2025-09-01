import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tdhbuutpolmwxjgzqxtp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Try to authenticate as admin to check RLS
async function checkRLSPolicies() {
  console.log('Checking RLS policies on custom_requests table...');
  
  // First, let's try to get the current user
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  console.log('Current session:', session?.user?.email, sessionError?.message);
  
  // Try to check if RLS is enabled on custom_requests
  try {
    // This is a workaround to check RLS - we'll try to insert and see what happens
    const testId = '00000000-0000-0000-0000-000000000000'; // Invalid UUID
    
    const { error } = await supabase
      .from('custom_requests')
      .update({ status: 'test' })
      .eq('id', testId);
    
    if (error) {
      console.log('RLS error details:', error.message);
      if (error.message.includes('permission denied')) {
        console.log('RLS is likely enabled and blocking the update');
      }
    } else {
      console.log('Update succeeded (unexpected)');
    }
  } catch (e) {
    console.log('Error during RLS check:', e.message);
  }
  
  // Let's also check what we can see in the table
  const { data: requests, error: fetchError } = await supabase
    .from('custom_requests')
    .select('id, status, user_id')
    .limit(3);
  
  if (fetchError) {
    console.log('Fetch error:', fetchError.message);
  } else {
    console.log('Sample requests:', requests);
  }
}

checkRLSPolicies().catch(console.error);