
-- Update the protect_primary_owner_profile function to also protect KYC
CREATE OR REPLACE FUNCTION public.protect_primary_owner_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Prevent deactivating the primary owner
  IF TG_OP = 'UPDATE' THEN
    IF public.is_primary_owner(OLD.user_id) THEN
      -- Prevent deactivation
      IF NEW.is_active = false THEN
        RAISE EXCEPTION 'Cannot deactivate the primary owner account';
      END IF;
      
      -- Prevent KYC status changes (protect approved status)
      IF OLD.kyc_status = 'approved' AND NEW.kyc_status != 'approved' THEN
        RAISE EXCEPTION 'Cannot change the primary owner KYC status';
      END IF;
      
      -- Prevent clearing KYC document
      IF OLD.kyc_document_url IS NOT NULL AND NEW.kyc_document_url IS NULL THEN
        RAISE EXCEPTION 'Cannot remove the primary owner KYC document';
      END IF;
    END IF;
  END IF;
  
  -- Prevent deleting the primary owner profile
  IF TG_OP = 'DELETE' THEN
    IF public.is_primary_owner(OLD.user_id) THEN
      RAISE EXCEPTION 'Cannot delete the primary owner profile';
    END IF;
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$function$;
