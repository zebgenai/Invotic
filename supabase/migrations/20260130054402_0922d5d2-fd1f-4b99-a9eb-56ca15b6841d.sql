-- Update the handle_new_user function to include specialty
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _full_name text;
  _specialty user_specialty;
BEGIN
  -- Get full_name from metadata or email
  _full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Get specialty from metadata
  _specialty := (NEW.raw_user_meta_data->>'specialty')::user_specialty;

  -- Create profile for the new user
  INSERT INTO public.profiles (user_id, email, full_name, specialty)
  VALUES (NEW.id, NEW.email, _full_name, _specialty);

  -- Create default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;