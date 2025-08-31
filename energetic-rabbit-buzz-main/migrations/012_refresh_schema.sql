-- Refresh Supabase schema cache
-- This ensures that all policy changes are properly applied

SELECT pg_notify('pgrst', 'reload schema');