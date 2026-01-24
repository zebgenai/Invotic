-- Add is_public column to chat_rooms to mark rooms as publicly accessible
ALTER TABLE public.chat_rooms ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- Create function to auto-add new users to all public chat rooms
CREATE OR REPLACE FUNCTION public.auto_add_user_to_public_rooms()
RETURNS TRIGGER AS $$
BEGIN
  -- Add the new user to all public chat rooms
  INSERT INTO public.chat_room_members (room_id, user_id, can_post)
  SELECT cr.id, NEW.user_id, true
  FROM public.chat_rooms cr
  WHERE cr.is_public = true
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to run after a new profile is created (which happens on signup)
DROP TRIGGER IF EXISTS auto_add_to_public_rooms ON public.profiles;
CREATE TRIGGER auto_add_to_public_rooms
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_add_user_to_public_rooms();

-- Create function to add all existing users to a room when it becomes public
CREATE OR REPLACE FUNCTION public.add_existing_users_to_public_room()
RETURNS TRIGGER AS $$
BEGIN
  -- When a room is marked as public, add all existing users
  IF NEW.is_public = true AND (OLD.is_public = false OR OLD.is_public IS NULL) THEN
    INSERT INTO public.chat_room_members (room_id, user_id, can_post)
    SELECT NEW.id, p.user_id, true
    FROM public.profiles p
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for when a room is updated to be public
DROP TRIGGER IF EXISTS add_users_when_room_becomes_public ON public.chat_rooms;
CREATE TRIGGER add_users_when_room_becomes_public
  AFTER UPDATE ON public.chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.add_existing_users_to_public_room();

-- Also add all existing users when a new public room is created
CREATE OR REPLACE FUNCTION public.add_existing_users_on_public_room_create()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_public = true THEN
    INSERT INTO public.chat_room_members (room_id, user_id, can_post)
    SELECT NEW.id, p.user_id, true
    FROM public.profiles p
    WHERE p.user_id != NEW.created_by
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS add_users_on_public_room_create ON public.chat_rooms;
CREATE TRIGGER add_users_on_public_room_create
  AFTER INSERT ON public.chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.add_existing_users_on_public_room_create();

-- Update RLS policy to allow admins/managers to update chat rooms (to mark as public)
DROP POLICY IF EXISTS "Admins and managers can update chat rooms" ON public.chat_rooms;
CREATE POLICY "Admins and managers can update chat rooms"
  ON public.chat_rooms
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));