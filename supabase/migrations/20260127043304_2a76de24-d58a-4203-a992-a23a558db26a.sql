-- Create a function to check if a user is the primary owner (protected account)
CREATE OR REPLACE FUNCTION public.is_primary_owner(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = check_user_id
      AND email = 'atifcyber7@gmail.com'
  )
$$;

-- Create a trigger function to prevent modifying the primary owner's role
CREATE OR REPLACE FUNCTION public.protect_primary_owner_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- For DELETE operations
  IF TG_OP = 'DELETE' THEN
    IF public.is_primary_owner(OLD.user_id) THEN
      RAISE EXCEPTION 'Cannot remove the primary owner role';
    END IF;
    RETURN OLD;
  END IF;
  
  -- For UPDATE operations (prevent role downgrade)
  IF TG_OP = 'UPDATE' THEN
    IF public.is_primary_owner(OLD.user_id) AND NEW.role != 'admin' THEN
      RAISE EXCEPTION 'Cannot change the primary owner role';
    END IF;
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on user_roles table
DROP TRIGGER IF EXISTS protect_primary_owner_trigger ON public.user_roles;
CREATE TRIGGER protect_primary_owner_trigger
  BEFORE UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_primary_owner_role();

-- Create a trigger function to prevent deactivating the primary owner profile
CREATE OR REPLACE FUNCTION public.protect_primary_owner_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent deactivating the primary owner
  IF TG_OP = 'UPDATE' THEN
    IF public.is_primary_owner(OLD.user_id) AND NEW.is_active = false THEN
      RAISE EXCEPTION 'Cannot deactivate the primary owner account';
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
$$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS protect_primary_owner_profile_trigger ON public.profiles;
CREATE TRIGGER protect_primary_owner_profile_trigger
  BEFORE UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_primary_owner_profile();