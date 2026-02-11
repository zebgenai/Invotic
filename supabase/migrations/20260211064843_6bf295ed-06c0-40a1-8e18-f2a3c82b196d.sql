
-- Fix the workspace_members SELECT policy that has a self-referencing bug
DROP POLICY IF EXISTS "Members can view workspace members" ON public.workspace_members;

CREATE POLICY "Members can view workspace members"
ON public.workspace_members
FOR SELECT
USING (
  (EXISTS (
    SELECT 1
    FROM workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
  ))
  OR has_role(auth.uid(), 'admin'::app_role)
);
