-- Add unique handle field to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS handle text UNIQUE;

-- Create an index for faster handle lookups
CREATE INDEX IF NOT EXISTS idx_profiles_handle ON public.profiles(handle);

-- Generate initial handles from full_name (lowercase, replace spaces with underscore, add random suffix for uniqueness)
UPDATE public.profiles 
SET handle = lower(replace(full_name, ' ', '_')) || '_' || substring(id::text, 1, 4)
WHERE handle IS NULL;