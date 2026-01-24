import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface YouTubeChannelStats {
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
}

interface YouTubeAPIResponse {
  items?: Array<{
    id: string;
    statistics: YouTubeChannelStats;
  }>;
  error?: {
    message: string;
  };
}

// Extract channel ID or handle from YouTube URL
function extractChannelIdentifier(url: string): { type: 'id' | 'handle' | 'username' | 'custom', value: string } | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Format: youtube.com/channel/UC...
    const channelMatch = pathname.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/);
    if (channelMatch) {
      return { type: 'id', value: channelMatch[1] };
    }

    // Format: youtube.com/@handle
    const handleMatch = pathname.match(/\/@([a-zA-Z0-9_-]+)/);
    if (handleMatch) {
      return { type: 'handle', value: handleMatch[1] };
    }

    // Format: youtube.com/user/username
    const userMatch = pathname.match(/\/user\/([a-zA-Z0-9_-]+)/);
    if (userMatch) {
      return { type: 'username', value: userMatch[1] };
    }

    // Format: youtube.com/c/customname
    const customMatch = pathname.match(/\/c\/([a-zA-Z0-9_-]+)/);
    if (customMatch) {
      return { type: 'custom', value: customMatch[1] };
    }

    return null;
  } catch {
    return null;
  }
}

async function getChannelIdFromHandle(handle: string, apiKey: string): Promise<string | null> {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle}&key=${apiKey}`
  );
  const data = await response.json();
  return data.items?.[0]?.id || null;
}

async function getChannelIdFromUsername(username: string, apiKey: string): Promise<string | null> {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${username}&key=${apiKey}`
  );
  const data = await response.json();
  return data.items?.[0]?.id || null;
}

async function getChannelStats(channelId: string, apiKey: string): Promise<YouTubeChannelStats | null> {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`
  );
  const data: YouTubeAPIResponse = await response.json();
  
  if (data.error) {
    console.error('YouTube API Error:', data.error.message);
    return null;
  }

  return data.items?.[0]?.statistics || null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      throw new Error('YOUTUBE_API_KEY not configured');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { channel_id, channel_link } = await req.json();
    
    console.log('Processing channel:', { channel_id, channel_link });

    // Extract channel identifier from URL
    const identifier = extractChannelIdentifier(channel_link);
    if (!identifier) {
      return new Response(
        JSON.stringify({ error: 'Invalid YouTube channel URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Extracted identifier:', identifier);

    // Get the actual channel ID
    let youtubeChannelId: string | null = null;
    
    if (identifier.type === 'id') {
      youtubeChannelId = identifier.value;
    } else if (identifier.type === 'handle') {
      youtubeChannelId = await getChannelIdFromHandle(identifier.value, YOUTUBE_API_KEY);
    } else if (identifier.type === 'username') {
      youtubeChannelId = await getChannelIdFromUsername(identifier.value, YOUTUBE_API_KEY);
    } else if (identifier.type === 'custom') {
      // Try handle first, then username
      youtubeChannelId = await getChannelIdFromHandle(identifier.value, YOUTUBE_API_KEY);
      if (!youtubeChannelId) {
        youtubeChannelId = await getChannelIdFromUsername(identifier.value, YOUTUBE_API_KEY);
      }
    }

    if (!youtubeChannelId) {
      return new Response(
        JSON.stringify({ error: 'Could not find YouTube channel' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found YouTube Channel ID:', youtubeChannelId);

    // Fetch channel statistics
    const stats = await getChannelStats(youtubeChannelId, YOUTUBE_API_KEY);
    if (!stats) {
      return new Response(
        JSON.stringify({ error: 'Could not fetch channel statistics' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Channel stats:', stats);

    // Update the database with the stats
    const { error: updateError } = await supabase
      .from('youtube_channels')
      .update({
        youtube_channel_id: youtubeChannelId,
        subscriber_count: parseInt(stats.subscriberCount) || 0,
        video_count: parseInt(stats.videoCount) || 0,
        view_count: parseInt(stats.viewCount) || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', channel_id);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        youtube_channel_id: youtubeChannelId,
        subscriber_count: parseInt(stats.subscriberCount) || 0,
        video_count: parseInt(stats.videoCount) || 0,
        view_count: parseInt(stats.viewCount) || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
