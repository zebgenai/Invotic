DROP POLICY IF EXISTS "Managers and admins can delete tasks" ON public.tasks;
CREATE POLICY "Users can delete own or assigned tasks"
ON public.tasks
FOR DELETE
TO authenticated
USING (
  assigned_to = auth.uid()
  OR assigned_by = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
);