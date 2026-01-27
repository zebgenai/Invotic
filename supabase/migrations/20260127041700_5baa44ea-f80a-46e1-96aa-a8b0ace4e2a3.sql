-- Create storage bucket for KYC documents if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents', 
  'kyc-documents', 
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create policies for KYC documents bucket
DO $$
BEGIN
  -- Users can upload their own KYC documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload KYC documents'
  ) THEN
    CREATE POLICY "Users can upload KYC documents"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- Users can view their own KYC documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can view own KYC documents'
  ) THEN
    CREATE POLICY "Users can view own KYC documents"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- Admins can view all KYC documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can view all KYC documents'
  ) THEN
    CREATE POLICY "Admins can view all KYC documents"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'kyc-documents' AND has_role(auth.uid(), 'admin'));
  END IF;
END $$;