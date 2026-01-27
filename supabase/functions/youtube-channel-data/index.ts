const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extract channel ID from various YouTube URL formats
function extractChannelId(url: string): { type: 'channel' | 'handle' | 'user' | 'custom'; value: string } | null {
  const patterns = [
    // Channel ID format: youtube.com/channel/UC...
    { regex: /youtube\.com\/channel\/(UC[\w-]+)/i, type: 'channel' as const },
    // Handle format: youtube.com/@handle
    { regex: /youtube\.com\/@([\w.-]+)/i, type: 'handle' as const },
    // User format: youtube.com/user/username
    { regex: /youtube\.com\/user\/([\w-]+)/i, type: 'user' as const },
    // Custom URL format: youtube.com/c/customname
    { regex: /youtube\.com\/c\/([\w-]+)/i, type: 'custom' as const },
    // Direct custom URL: youtube.com/customname (fallback)
    { regex: /youtube\.com\/([\w-]+)$/i, type: 'custom' as const },
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern.regex);
    if (match) {
      return { type: pattern.type, value: match[1] };
    }
  }

  return null;
}

// Fetch channel data from YouTube Data API
async function fetchChannelData(apiKey: string, channelId: string): Promise<any> {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (!response.ok) {
    console.error('YouTube API error:', data);
    throw new Error(data.error?.message || 'Failed to fetch channel data');
  }
  
  return data;
}

// Fetch latest videos from channel
async function fetchLatestVideos(apiKey: string, channelId: string, maxResults: number = 5): Promise<any[]> {
  // First get the uploads playlist ID
  const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
  const channelResponse = await fetch(channelUrl);
  const channelData = await channelResponse.json();
  
  if (!channelResponse.ok || !channelData.items?.length) {
    console.error('Failed to get uploads playlist:', channelData);
    return [];
  }
  
  const uploadsPlaylistId = channelData.items[0].contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) {
    console.log('No uploads playlist found');
    return [];
  }
  
  // Fetch videos from uploads playlist
  const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${apiKey}`;
  const playlistResponse = await fetch(playlistUrl);
  const playlistData = await playlistResponse.json();
  
  if (!playlistResponse.ok) {
    console.error('Failed to fetch playlist items:', playlistData);
    return [];
  }
  
  const videoIds = playlistData.items?.map((item: any) => item.contentDetails.videoId).join(',');
  if (!videoIds) return [];
  
  // Get video statistics
  const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${apiKey}`;
  const videosResponse = await fetch(videosUrl);
  const videosData = await videosResponse.json();
  
  if (!videosResponse.ok) {
    console.error('Failed to fetch video details:', videosData);
    return [];
  }
  
  return videosData.items?.map((video: any) => ({
    id: video.id,
    title: video.snippet.title,
    description: video.snippet.description?.substring(0, 200),
    thumbnail: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url,
    published_at: video.snippet.publishedAt,
    duration: video.contentDetails.duration,
    view_count: parseInt(video.statistics.viewCount) || 0,
    like_count: parseInt(video.statistics.likeCount) || 0,
    comment_count: parseInt(video.statistics.commentCount) || 0,
  })) || [];
}

// Resolve handle/username to channel ID
async function resolveToChannelId(apiKey: string, identifier: string, type: 'handle' | 'user' | 'custom'): Promise<string | null> {
  // For handles, use the search API with exact matching
  if (type === 'handle') {
    // Try searching with the @ prefix for better matching
    const searchQuery = `@${identifier}`;
    console.log('Searching for handle:', searchQuery);
    
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(searchQuery)}&maxResults=5&key=${apiKey}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchResponse.ok) {
      console.error('Search API error:', searchData);
      return null;
    }
    
    console.log('Search results:', JSON.stringify(searchData.items?.map((i: any) => ({ 
      id: i.snippet?.channelId, 
      title: i.snippet?.title,
      customUrl: i.snippet?.customUrl 
    }))));
    
    if (searchData.items && searchData.items.length > 0) {
      // Return the first channel result
      return searchData.items[0].snippet?.channelId || searchData.items[0].id?.channelId;
    }
  }
  
  // For user type, use forUsername parameter
  if (type === 'user') {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${identifier}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok && data.items && data.items.length > 0) {
      return data.items[0].id;
    }
  }
  
  // Fallback: general search
  console.log('Fallback search for:', identifier);
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(identifier)}&maxResults=1&key=${apiKey}`;
  const searchResponse = await fetch(searchUrl);
  const searchData = await searchResponse.json();
  
  if (searchResponse.ok && searchData.items && searchData.items.length > 0) {
    return searchData.items[0].snippet?.channelId || searchData.items[0].id?.channelId;
  }
  
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channel_link } = await req.json();

    if (!channel_link) {
      return new Response(
        JSON.stringify({ success: false, error: 'Channel link is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) {
      console.error('YOUTUBE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'YouTube API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing channel link:', channel_link);

    // Extract channel identifier from URL
    const extracted = extractChannelId(channel_link);
    
    if (!extracted) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid YouTube channel URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Extracted:', extracted);

    let channelId: string;

    if (extracted.type === 'channel') {
      // Direct channel ID
      channelId = extracted.value;
    } else {
      // Need to resolve handle/user/custom to channel ID
      const resolvedId = await resolveToChannelId(apiKey, extracted.value, extracted.type);
      
      if (!resolvedId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Could not find YouTube channel. Please try using the channel ID URL format (youtube.com/channel/UC...)' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      channelId = resolvedId;
    }

    console.log('Fetching data for channel ID:', channelId);

    // Fetch channel statistics and latest videos in parallel
    const [channelData, latestVideos] = await Promise.all([
      fetchChannelData(apiKey, channelId),
      fetchLatestVideos(apiKey, channelId, 5)
    ]);

    if (!channelData.items || channelData.items.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Channel not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const channel = channelData.items[0];
    const { snippet, statistics } = channel;

    const result = {
      success: true,
      data: {
        youtube_channel_id: channel.id,
        channel_name: snippet.title,
        description: snippet.description?.substring(0, 500) || null,
        thumbnail_url: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
        subscriber_count: parseInt(statistics.subscriberCount) || 0,
        video_count: parseInt(statistics.videoCount) || 0,
        view_count: parseInt(statistics.viewCount) || 0,
        country: snippet.country || null,
        custom_url: snippet.customUrl || null,
        published_at: snippet.publishedAt,
        latest_videos: latestVideos,
      },
      fetched_at: new Date().toISOString(),
    };

    console.log('Successfully fetched channel data:', result.data.channel_name, 'Subscribers:', result.data.subscriber_count, 'Videos:', latestVideos.length);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching YouTube channel data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch channel data';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
