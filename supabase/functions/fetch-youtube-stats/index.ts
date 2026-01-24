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
    code: number;
  };
}

interface YouTubeSearchResponse {
  items?: Array<{
    id: {
      channelId?: string;
    };
    snippet: {
      channelId: string;
    };
  }>;
  error?: {
    message: string;
    code: number;
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
    const handleMatch = pathname.match(/\/@([a-zA-Z0-9_.-]+)/);
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
  // First try the forHandle parameter
  const handleUrl = `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`;
  console.log('Trying forHandle:', handleUrl.replace(apiKey, 'API_KEY'));
  
  const response = await fetch(handleUrl);
  const data = await response.json();
  console.log('forHandle response:', JSON.stringify(data));
  
  if (data.items?.[0]?.id) {
    return data.items[0].id;
  }
  
  // Fallback: Search for the channel
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent('@' + handle)}&maxResults=1&key=${apiKey}`;
  console.log('Trying search:', searchUrl.replace(apiKey, 'API_KEY'));
  
  const searchResponse = await fetch(searchUrl);
  const searchData: YouTubeSearchResponse = await searchResponse.json();
  console.log('Search response:', JSON.stringify(searchData));
  
  if (searchData.error) {
    console.error('YouTube Search API Error:', searchData.error.message);
    return null;
  }
  
  return searchData.items?.[0]?.snippet?.channelId || null;
}

async function getChannelIdFromUsername(username: string, apiKey: string): Promise<string | null> {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${encodeURIComponent(username)}&key=${apiKey}`
  );
  const data = await response.json();
  console.log('Username lookup response:', JSON.stringify(data));
  
  if (data.items?.[0]?.id) {
    return data.items[0].id;
  }
  
  // Fallback to search
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(username)}&maxResults=1&key=${apiKey}`;
  const searchResponse = await fetch(searchUrl);
  const searchData: YouTubeSearchResponse = await searchResponse.json();
  
  return searchData.items?.[0]?.snippet?.channelId || null;
}

async function getChannelStats(channelId: string, apiKey: string): Promise<YouTubeChannelStats | null> {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;
  console.log('Fetching stats for channel:', channelId);
  
  const response = await fetch(url);
  const data: YouTubeAPIResponse = await response.json();
  console.log('Stats response:', JSON.stringify(data));
  
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
      console.error('YOUTUBE_API_KEY not found in environment');
      throw new Error('YOUTUBE_API_KEY not configured');
    }
    console.log('API Key configured:', YOUTUBE_API_KEY.substring(0, 8) + '...');

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { channel_id, channel_link } = await req.json();
    
    console.log('Processing channel:', { channel_id, channel_link });

    // Extract channel identifier from URL
    const identifier = extractChannelIdentifier(channel_link);
    if (!identifier) {
      console.error('Invalid URL format:', channel_link);
      return new Response(
        JSON.stringify({ error: 'Invalid YouTube channel URL format. Use formats like youtube.com/@handle or youtube.com/channel/UCxxxxx' }),
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
      youtubeChannelId = await getChannelIdFromHandle(identifier.value, YOUTUBE_API_KEY);
      if (!youtubeChannelId) {
        youtubeChannelId = await getChannelIdFromUsername(identifier.value, YOUTUBE_API_KEY);
      }
    }

    if (!youtubeChannelId) {
      console.error('Could not resolve channel ID for:', identifier);
      return new Response(
        JSON.stringify({ error: 'Could not find YouTube channel. Please verify the channel URL is correct.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found YouTube Channel ID:', youtubeChannelId);

    // Fetch channel statistics
    const stats = await getChannelStats(youtubeChannelId, YOUTUBE_API_KEY);
    if (!stats) {
      console.error('Could not fetch stats for channel:', youtubeChannelId);
      return new Response(
        JSON.stringify({ error: 'Could not fetch channel statistics' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Channel stats:', stats);

    // Update the database with the stats
    const updateData = {
      youtube_channel_id: youtubeChannelId,
      subscriber_count: parseInt(stats.subscriberCount) || 0,
      video_count: parseInt(stats.videoCount) || 0,
      view_count: parseInt(stats.viewCount) || 0,
      updated_at: new Date().toISOString(),
    };
    
    console.log('Updating database with:', updateData);

    const { error: updateError } = await supabase
      .from('youtube_channels')
      .update(updateData)
      .eq('id', channel_id);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log('Database updated successfully');

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
