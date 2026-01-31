-- Add specialties column to profiles as an array to support 1-3 selections
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS specialties text[] DEFAULT NULL;

-- Migrate existing specialty data to specialties array
UPDATE public.profiles
SET specialties = ARRAY[specialty::text]
WHERE specialty IS NOT NULL AND specialties IS NULL;