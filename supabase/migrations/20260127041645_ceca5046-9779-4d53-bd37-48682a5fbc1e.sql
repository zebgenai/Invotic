-- Create storage bucket for chat files (voice messages and attachments)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-files', 
  'chat-files', 
  true,
  10485760, -- 10MB limit
  ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Create policies for chat files bucket
CREATE POLICY "Authenticated users can upload chat files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY "Anyone can view chat files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'chat-files');

CREATE POLICY "Users can delete their own chat files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[2]);