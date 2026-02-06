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

    const { action, channelId, content, limit = 50, imageBase64, imageName } = await req.json();
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
        console.log(`Sending message to channel ${channelId}`);
        
        // If there's an image, use multipart form data
        if (imageBase64 && imageName) {
          console.log(`Sending message with image: ${imageName}`);
          
          // Decode base64 to binary
          const binaryData = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));
          
          // Create form data boundary
          const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
          
          // Build multipart form data manually
          const encoder = new TextEncoder();
          const parts: Uint8Array[] = [];
          
          // Add content field if present
          if (content) {
            const contentPart = encoder.encode(
              `--${boundary}\r\n` +
              `Content-Disposition: form-data; name="content"\r\n\r\n` +
              `${content}\r\n`
            );
            parts.push(contentPart);
          }
          
          // Add file field
          const fileHeaderPart = encoder.encode(
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="files[0]"; filename="${imageName}"\r\n` +
            `Content-Type: image/${imageName.split('.').pop() || 'png'}\r\n\r\n`
          );
          parts.push(fileHeaderPart);
          parts.push(binaryData);
          parts.push(encoder.encode('\r\n'));
          
          // Add closing boundary
          parts.push(encoder.encode(`--${boundary}--\r\n`));
          
          // Combine all parts
          const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
          const body = new Uint8Array(totalLength);
          let offset = 0;
          for (const part of parts) {
            body.set(part, offset);
            offset += part.length;
          }
          
          const response = await fetch(
            `${DISCORD_API_BASE}/channels/${channelId}/messages`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
              },
              body: body,
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
          console.log(`Message with image sent successfully: ${message.id}`);
          return new Response(
            JSON.stringify({ message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Text-only message
        if (!content) {
          return new Response(
            JSON.stringify({ error: 'Message content or image is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
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
