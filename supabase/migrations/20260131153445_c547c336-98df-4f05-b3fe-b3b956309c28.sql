-- Add policy to allow admins and managers to delete chat rooms
CREATE POLICY "Admins and managers can delete chat rooms"
ON public.chat_rooms
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));