-- Create table to store daily channel analytics snapshots for historical tracking
CREATE TABLE public.channel_analytics_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id uuid NOT NULL REFERENCES public.youtube_channels(id) ON DELETE CASCADE,
  subscriber_count integer NOT NULL DEFAULT 0,
  view_count bigint NOT NULL DEFAULT 0,
  video_count integer NOT NULL DEFAULT 0,
  recorded_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(channel_id, recorded_at)
);

-- Enable RLS
ALTER TABLE public.channel_analytics_history ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view analytics history
CREATE POLICY "Authenticated users can view analytics history"
  ON public.channel_analytics_history FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow system/admin to insert analytics data
CREATE POLICY "Admins can insert analytics history"
  ON public.channel_analytics_history FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for efficient date-based queries
CREATE INDEX idx_channel_analytics_date ON public.channel_analytics_history(recorded_at DESC);
CREATE INDEX idx_channel_analytics_channel ON public.channel_analytics_history(channel_id);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_analytics_history;