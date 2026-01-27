import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  published_at: string;
  duration: string;
  view_count: number;
  like_count: number;
  comment_count: number;
}

export interface YouTubeAnalytics {
  youtube_channel_id: string;
  channel_name: string;
  description: string | null;
  thumbnail_url: string;
  subscriber_count: number;
  video_count: number;
  view_count: number;
  country: string | null;
  custom_url: string | null;
  published_at: string;
  latest_videos: YouTubeVideo[];
}

interface UseYouTubeAnalyticsResult {
  data: YouTubeAnalytics | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
  refetch: () => Promise<void>;
}

export const useYouTubeAnalytics = (
  channelUrlOrId: string | null,
  autoRefreshInterval: number = 60000 // 60 seconds default
): UseYouTubeAnalyticsResult => {
  const [data, setData] = useState<YouTubeAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!channelUrlOrId) {
      setData(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: response, error: fnError } = await supabase.functions.invoke(
        'youtube-channel-data',
        {
          body: { channel_link: channelUrlOrId },
        }
      );

      if (fnError) {
        throw new Error(fnError.message || 'Failed to fetch channel data');
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch channel data');
      }

      setData(response.data);
      setLastFetched(new Date(response.fetched_at));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('YouTube Analytics Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [channelUrlOrId]);

  // Initial fetch
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh interval
  useEffect(() => {
    if (!channelUrlOrId || autoRefreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      fetchAnalytics();
    }, autoRefreshInterval);

    return () => clearInterval(intervalId);
  }, [channelUrlOrId, autoRefreshInterval, fetchAnalytics]);

  return {
    data,
    isLoading,
    error,
    lastFetched,
    refetch: fetchAnalytics,
  };
};

// Helper to format duration from ISO 8601
export const formatDuration = (isoDuration: string): string => {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Helper to format large numbers
export const formatCount = (count: number): string => {
  if (count >= 1_000_000_000) {
    return `${(count / 1_000_000_000).toFixed(1)}B`;
  }
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toString();
};
