# How to Run the Migration

To add the description field to the profiles table and create the site_settings table, you need to run the migration files we created:

## First Migration (014)
1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy the contents of the file `migrations/014_add_description_to_profiles.sql`
4. Paste it into the SQL Editor
5. Run the query

This will:
- Add a description column to the profiles table
- Create a site_settings table for future use
- Set up proper indexes and permissions

## Second Migration (015)
1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy the contents of the file `migrations/015_add_is_admin_to_profiles.sql`
4. Paste it into the SQL Editor
5. Run the query

This will:
- Add an is_admin column to the profiles table to properly identify the admin user
- Set the admin flag for the admin user (mredza31@gmail.com)
- Add an index for better performance

## Third Migration (016)
1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy the contents of the file `migrations/016_create_admin_profile_function.sql`
4. Paste it into the SQL Editor
5. Run the query

This will:
- Create an RPC function for safely updating admin profiles
- Grant execute permissions to authenticated users
- Ensure the admin user has the correct permissions

After running all migrations, the admin will be able to edit their profile information and description from the new "About Page" section in the admin dashboard, and the public About page will correctly display the admin's information.