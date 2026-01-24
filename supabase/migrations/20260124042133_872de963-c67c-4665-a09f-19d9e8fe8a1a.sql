-- Add view_count column to youtube_channels table
ALTER TABLE public.youtube_channels 
ADD COLUMN IF NOT EXISTS view_count bigint DEFAULT 0;

-- Add channel_id column to store the YouTube channel ID for API lookups
ALTER TABLE public.youtube_channels 
ADD COLUMN IF NOT EXISTS youtube_channel_id text;