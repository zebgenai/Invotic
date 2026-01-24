-- First, drop the problematic policies
DROP POLICY IF EXISTS "Members can view room members" ON public.chat_room_members;
DROP POLICY IF EXISTS "Members can view chat rooms" ON public.chat_rooms;

-- Create a SECURITY DEFINER function to check room membership (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_room_member(_user_id uuid, _room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_room_members
    WHERE user_id = _user_id
      AND room_id = _room_id
  )
$$;

-- Create a function to check if user created the room
CREATE OR REPLACE FUNCTION public.is_room_creator(_user_id uuid, _room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_rooms
    WHERE id = _room_id
      AND created_by = _user_id
  )
$$;

-- Recreate chat_room_members policies using the helper function
CREATE POLICY "Members can view room members"
ON public.chat_room_members
FOR SELECT
USING (
  public.is_room_member(auth.uid(), room_id)
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- Recreate chat_rooms SELECT policy
CREATE POLICY "Members can view chat rooms"
ON public.chat_rooms
FOR SELECT
USING (
  created_by = auth.uid()
  OR public.is_room_member(auth.uid(), id)
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- Also need to add user as member when creating a room
-- Create a trigger to auto-add creator as room member
CREATE OR REPLACE FUNCTION public.auto_add_room_creator()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.chat_room_members (room_id, user_id, can_post)
  VALUES (NEW.id, NEW.created_by, true);
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_chat_room_created ON public.chat_rooms;
CREATE TRIGGER on_chat_room_created
  AFTER INSERT ON public.chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_add_room_creator();