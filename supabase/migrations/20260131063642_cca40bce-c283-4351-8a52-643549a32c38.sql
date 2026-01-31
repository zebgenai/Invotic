-- Add column for back side of CNIC document
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS kyc_document_back_url TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.kyc_document_url IS 'Front side of CNIC/ID document';
COMMENT ON COLUMN public.profiles.kyc_document_back_url IS 'Back side of CNIC/ID document';