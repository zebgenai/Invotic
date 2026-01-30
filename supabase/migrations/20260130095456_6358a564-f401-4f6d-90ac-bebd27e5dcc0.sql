-- Add policy for admins to delete any channel
CREATE POLICY "Admins can delete any channel"
ON public.youtube_channels
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add policy for admins to update any channel
CREATE POLICY "Admins can update any channel"
ON public.youtube_channels
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));