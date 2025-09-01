import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tdhbuutpolmwxjgzqxtp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkDatabaseTriggers() {
  console.log('Checking for database triggers and functions...');
  
  // Check for triggers on custom_requests table
  try {
    const { data: triggers, error: triggersError } = await supabase
      .rpc('get_triggers'); // This might not work
    
    if (triggersError) {
      console.log('Could not get triggers via RPC:', triggersError.message);
    } else {
      console.log('Triggers:', triggers);
    }
  } catch (e) {
    console.log('RPC call failed:', e.message);
  }
  
  // Try a raw SQL query if possible
  try {
    // This won't work with anon key, but let's see what happens
    const { data, error } = await supabase
      .from('pg_trigger')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('Cannot access pg_trigger directly:', error.message);
    } else {
      console.log('Trigger data:', data);
    }
  } catch (e) {
    console.log('Direct access failed:', e.message);
  }
}

checkDatabaseTriggers().catch(console.error);