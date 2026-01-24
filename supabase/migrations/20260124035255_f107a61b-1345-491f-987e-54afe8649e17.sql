-- Drop existing policy for chat room creation
DROP POLICY IF EXISTS "Authenticated users can create chat rooms" ON public.chat_rooms;

-- Create new policy - only admins and managers can create chat rooms
CREATE POLICY "Only admins and managers can create chat rooms"
ON public.chat_rooms
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) 
  OR public.has_role(auth.uid(), 'manager'::app_role)
);