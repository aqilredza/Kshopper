// Test script to create a sample order with items
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tdhbuutpolmwxjgzqxtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createTestOrder() {
  console.log('This script needs to be run with an authenticated user.');
  console.log('Please log in through the app first, then run this script from the browser console.');
}

createTestOrder();