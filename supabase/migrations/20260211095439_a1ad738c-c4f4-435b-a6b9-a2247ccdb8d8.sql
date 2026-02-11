-- Fix overly permissive analytics history insert policy
DROP POLICY IF EXISTS "Admins can insert analytics history" ON public.channel_analytics_history;

CREATE POLICY "Only admins can insert analytics history"
  ON public.channel_analytics_history FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));