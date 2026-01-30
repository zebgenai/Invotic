-- Create enum for user specialties
CREATE TYPE public.user_specialty AS ENUM (
  'script_writer',
  'video_editor',
  'thumbnail_designer',
  'voice_over_artist',
  'seo_specialist',
  'channel_manager'
);

-- Add specialty column to profiles table
ALTER TABLE public.profiles ADD COLUMN specialty public.user_specialty NULL;