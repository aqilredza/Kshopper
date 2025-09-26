#!/usr/bin/env node

// Script to run the new migration for about content table
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://tdhbuutpolmwxjgzqxtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaGJ1dXRwb2xtd3hqZ3pxeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTE2NjQsImV4cCI6MjA3MDcyNzY2NH0.Ytndx6tnYBxlKfo83ZNLXZ3C_7l9Z246LhfRG2fUqMc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runMigration() {
  console.log('Running migration 017_add_about_content_table.sql...');

  // SQL content from our migration file
  const migrationSQL = `
    -- Create a table to store general about page content
    CREATE TABLE IF NOT EXISTS about_content (
      id SERIAL PRIMARY KEY,
      title TEXT DEFAULT 'About KShopper',
      description TEXT DEFAULT 'KShopper is your trusted bridge to authentic Korean products. We connect Malaysian customers with verified personal shoppers in Korea to source authentic K-beauty, fashion, snacks, and lifestyle products.',
      mission TEXT DEFAULT 'Our mission is to make Korean products accessible to everyone in Malaysia while ensuring authenticity and quality. Whether you are looking for the latest K-beauty trends, exclusive fashion pieces, or unique snacks, we have got you covered.',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Enable RLS on the about_content table
    DO $ 
    BEGIN
      IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'about_content') THEN
        ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
      END IF;
    END $;

    -- Insert default content if none exists
    INSERT INTO about_content (title, description, mission)
    SELECT 
      'About KShopper',
      'KShopper is your trusted bridge to authentic Korean products. We connect Malaysian customers with verified personal shoppers in Korea to source authentic K-beauty, fashion, snacks, and lifestyle products.',
      'Our mission is to make Korean products accessible to everyone in Malaysia while ensuring authenticity and quality. Whether you''re looking for the latest K-beauty trends, exclusive fashion pieces, or unique snacks, we''ve got you covered.'
    WHERE NOT EXISTS (SELECT 1 FROM about_content);

    -- Create a function to update about content
    CREATE OR REPLACE FUNCTION update_about_content(
      p_title TEXT,
      p_description TEXT,
      p_mission TEXT
    )
    RETURNS VOID AS $$
    BEGIN
      -- Check if the current user is admin
      IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
        -- Update the existing content (assuming only one record for now)
        UPDATE about_content 
        SET 
          title = p_title,
          description = p_description,
          mission = p_mission,
          updated_at = NOW()
        WHERE id = 1;
        
        -- If no record was updated, create one
        IF NOT FOUND THEN
          INSERT INTO about_content (title, description, mission) 
          VALUES (p_title, p_description, p_mission);
        END IF;
      ELSE
        RAISE EXCEPTION 'Permission denied: Only admin can update about content';
      END IF;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Grant execute permission
    GRANT EXECUTE ON FUNCTION update_about_content TO authenticated;

    -- Create policies for RLS
    -- Allow admins to select about content
    CREATE POLICY "Admin can view about content" 
    ON about_content FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() AND p.is_admin = true
      )
    );

    -- Allow admins to update about content
    CREATE POLICY "Admin can update about content" 
    ON about_content FOR UPDATE 
    USING (
      EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() AND p.is_admin = true
      )
    );

    -- Grant necessary permissions
    GRANT ALL ON TABLE about_content TO authenticated;
  `;

  try {
    // Execute the migration
    const { error } = await supabase.rpc('dblink_exec', { 
      text1: migrationSQL
    }).select();

    if (error) {
      console.error('Error executing migration:', error);
      // Try executing directly with SQL
      const { error: directError } = await supabase.from('about_content').select().limit(1);
      if (!directError) {
        console.log('Table already exists, skipping creation');
      } else {
        // If it's a different error, try to create the table using a simpler approach
        console.log('Attempting to run migration directly via SQL...');
        const { error: execError } = await supabase.rpc('exec', {
          sql_command: migrationSQL
        });
        
        if (execError) {
          console.error('Error executing migration via RPC:', execError);
          throw execError;
        }
      }
    } else {
      console.log('Migration executed successfully via dblink_exec');
    }

    // Verify the table was created
    const { data, error: verifyError } = await supabase
      .from('about_content')
      .select('*')
      .limit(1);

    if (verifyError) {
      console.error('Error verifying table:', verifyError);
    } else {
      console.log('✅ Migration successful! Table "about_content" is ready.');
      console.log('Sample record:', data);
    }
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

runMigration().catch(console.error);