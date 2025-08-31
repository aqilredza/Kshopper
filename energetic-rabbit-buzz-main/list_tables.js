import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tdhbuutpolmwxjgzqxtp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function listTables() {
  console.log('Attempting to list tables...');
  
  // Try a simple query to see what works
  try {
    // This is a workaround to see what tables exist
    const { data, error } = await supabase
      .rpc('CURRENT_SCHEMA');
    
    console.log('Current schema:', data, error);
  } catch (e) {
    console.log('Error calling CURRENT_SCHEMA:', e);
  }
  
  // Try to query some common tables
  const tablesToCheck = ['menu_items', 'restaurant_platforms', 'products', 'items'];
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      console.log(`Table ${table} exists:`, error ? `No - ${error.message}` : 'Yes');
    } catch (e) {
      console.log(`Error checking table ${table}:`, e.message);
    }
  }
}

listTables();