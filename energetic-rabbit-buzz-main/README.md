# KShopper - Korean Shopping Platform

Welcome to your Dyad app - a complete e-commerce platform for Korean products with a unique custom request feature.

## Overview
KShopper connects Malaysian customers with personal shoppers in Korea to source authentic K-beauty, fashion, snacks, and lifestyle products.

## Key Features
- User authentication (login/signup)
- Product browsing by category (K-Beauty, K-Fashion, K-Food)
- Custom request system for items not in the catalog
- Shopping cart and checkout
- Admin dashboard for managing products and requests
- Real-time chat between users and admins for custom requests
- Customizable About Us page with admin profile management

## Tech Stack
- React + TypeScript with Vite
- Tailwind CSS with shadcn/ui components
- Supabase (auth, database, storage)
- React Query for state management

## Getting Started
1. Install dependencies: `npm install` or `pnpm install`
2. Set up Supabase database (see migrations folder)
3. Run the development server: `npm run dev`

## Database Setup
Run the SQL migration scripts in the `migrations` folder in order:
1. `001_create_custom_request_messages_table.sql` - Creates the chat table and sets up RLS
2. `002_verify_chat_setup.sql` - Verifies the setup is correct
3. `003_troubleshoot_chat.sql` - Use this if you encounter issues
4. `004_add_contact_number_to_profiles.sql` - Adds contact number field to profiles
5. `005_create_order_from_cart.sql` - Creates function to convert cart to order
6. `006_admin_view_orders.sql` - Adds policies to allow admin to view all orders
7. `007_enable_rls_orders.sql` - Enables RLS on orders table if not already enabled
8. `014_add_description_to_profiles.sql` - Adds description field to profiles table for About page (see ABOUT_PAGE_SETUP.md)
9. `015_add_is_admin_to_profiles.sql` - Adds is_admin flag to identify admin user
10. `016_create_admin_profile_function.sql` - Creates/updates RPC function for safe admin profile updates (with admin_title and email fields)
11. `017_add_about_content_table.sql` - Creates table for editable 'About KShopper' content (title, description, mission)

### Platform Setup (Required Before Adding Products)
Before adding products, you need to set up the platform structure:
1. Run the `sql/setup_menu_items_and_platform.sql` script in your Supabase SQL editor. This creates the required `platforms` and `menu_items` tables.
2. Then run the `complete_setup.sql` script to insert a default platform record and setup about content table (if not already present).
3. Verify the setup was successful by checking the output of the verification query in `complete_setup.sql`.

## Custom Request Chat Feature
Admins and users can now communicate directly about custom requests through a real-time chat interface:
- Admins can chat with users from the Custom Requests admin page
- Users can chat from their Account page or the request detail page
- Real-time messaging with message history
- Secure communication with proper access controls

## Admin About Page Management
Admins can now customize their profile information and description on the About Us page:
1. Log in as admin (mredza31@gmail.com)
2. Go to the Admin Dashboard
3. Click on "About Page" card
4. Edit profile information, upload an image, and modify the description
5. Preview changes and save

See `ABOUT_PAGE_SETUP.md` for detailed setup instructions.

## Troubleshooting
If you encounter the "Chat functionality is not set up yet" error:
1. Follow the steps in `FIX_CHAT_FUNCTIONALITY.md`
2. Run the database migration scripts
3. Check that all required tables exist
4. Verify that RLS policies are properly configured

If you encounter permission errors when adding products as admin:
1. Make sure you're logged in as `mredza31@gmail.com`
2. Run the `fix_menu_items_insert_policy.sql` script in your Supabase SQL editor
3. This will add the necessary RLS policies to allow admin users to insert/update/delete menu items

If you encounter "permission denied for table users" errors:
1. Run the `complete_permission_fix.sql` script in your Supabase SQL editor
2. This will comprehensively fix all policies that were directly querying the protected users table
3. The script creates a secure function for checking admin permissions using JWT claims instead of direct table queries

For detailed setup instructions, see `FIX_CHAT_FUNCTIONALITY.md`.
