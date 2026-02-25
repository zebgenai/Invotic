
-- Make chat-files bucket private
UPDATE storage.buckets SET public = false WHERE id = 'chat-files';

-- Drop the overly permissive view policy and replace with authenticated-only
DROP POLICY IF EXISTS "Anyone can view chat files" ON storage.objects;

CREATE POLICY "Authenticated users can view chat files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'chat-files' AND auth.uid() IS NOT NULL);
