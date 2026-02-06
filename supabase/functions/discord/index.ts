import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DISCORD_API_BASE = 'https://discord.com/api/v10';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const DISCORD_BOT_TOKEN = Deno.env.get('DISCORD_BOT_TOKEN');
    if (!DISCORD_BOT_TOKEN) {
      console.error('DISCORD_BOT_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Discord bot token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, channelId, content, limit = 50 } = await req.json();
    console.log(`Discord action: ${action}, channelId: ${channelId}`);

    const headers = {
      'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    };

    switch (action) {
      case 'getMessages': {
        console.log(`Fetching ${limit} messages from channel ${channelId}`);
        const response = await fetch(
          `${DISCORD_API_BASE}/channels/${channelId}/messages?limit=${limit}`,
          { headers }
        );
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Discord API error: ${response.status} - ${errorText}`);
          return new Response(
            JSON.stringify({ error: `Discord API error: ${response.status}`, details: errorText }),
            { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const messages = await response.json();
        console.log(`Fetched ${messages.length} messages`);
        return new Response(
          JSON.stringify({ messages }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'sendMessage': {
        if (!content) {
          return new Response(
            JSON.stringify({ error: 'Message content is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`Sending message to channel ${channelId}`);
        const response = await fetch(
          `${DISCORD_API_BASE}/channels/${channelId}/messages`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({ content }),
          }
        );
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Discord API error: ${response.status} - ${errorText}`);
          return new Response(
            JSON.stringify({ error: `Discord API error: ${response.status}`, details: errorText }),
            { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const message = await response.json();
        console.log(`Message sent successfully: ${message.id}`);
        return new Response(
          JSON.stringify({ message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'getChannels': {
        const guildId = channelId; // In this case, channelId is actually the guild ID
        console.log(`Fetching channels for guild ${guildId}`);
        const response = await fetch(
          `${DISCORD_API_BASE}/guilds/${guildId}/channels`,
          { headers }
        );
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Discord API error: ${response.status} - ${errorText}`);
          return new Response(
            JSON.stringify({ error: `Discord API error: ${response.status}`, details: errorText }),
            { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const channels = await response.json();
        // Filter to only text channels (type 0)
        const textChannels = channels.filter((c: any) => c.type === 0);
        console.log(`Fetched ${textChannels.length} text channels`);
        return new Response(
          JSON.stringify({ channels: textChannels }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Discord function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
