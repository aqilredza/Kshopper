import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tdhbuutpolmwxjgzqxtp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function listTables() {
  try {
    // Try to get table information
    const { data, error } = await supabase
      .from('custom_requests')
      .select('id', { count: 'exact', head: true });
    
    if (error) {
      console.log('Error accessing custom_requests table:', error.message);
    } else {
      console.log('Successfully accessed custom_requests table');
    }
    
    // Try another approach to list tables
    console.log('Attempting to list tables through a different method...');
    
    // Try to get all table names from information schema
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables'); // This might not work but let's try
    
    if (tablesError) {
      console.log('Could not list tables via RPC:', tablesError.message);
    } else {
      console.log('Tables:', tables);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

listTables();