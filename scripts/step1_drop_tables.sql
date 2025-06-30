-- Drop All Tables for DMG Project
-- Author: An Kun Studio Digital Music Distribution
-- Usage: For cleaning existing tables before fresh setup

-- Warning: This will delete ALL data!
-- Only run this if you want to start fresh

-- Drop tables in correct order (considering foreign keys)
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.artist CASCADE;
DROP TABLE IF EXISTS public.label_manager CASCADE;

-- Drop any related sequences or indexes if they exist
DROP SEQUENCE IF EXISTS public.submissions_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.artist_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.label_manager_id_seq CASCADE;

-- Note: CASCADE will automatically drop dependent objects
COMMENT ON SCHEMA public IS 'Fresh DMG Database Schema - All tables dropped';
