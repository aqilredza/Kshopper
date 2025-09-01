-- Create or replace function to handle new user creation
-- This function will automatically create a profile for new users
-- and transfer the contact_number from auth metadata to the profiles table

-- First, check if the function already exists
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';

-- Create the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new profile for the new user
  INSERT INTO public.profiles (id, full_name, contact_number, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'contact_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT ALL ON TABLE public.profiles TO authenticated;