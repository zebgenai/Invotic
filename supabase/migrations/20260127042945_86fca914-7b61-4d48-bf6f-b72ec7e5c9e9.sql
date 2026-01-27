-- Create RLS policy for admins to delete any message
CREATE POLICY "Admins can delete any message"
ON public.messages
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));