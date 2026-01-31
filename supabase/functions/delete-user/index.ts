import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: callingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !callingUser) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if caller is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", callingUser.id)
      .single();

    if (roleError || roleData?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Only admins can delete users" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if target user is primary owner
    const { data: targetProfile } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("user_id", user_id)
      .single();

    if (targetProfile?.email === "atifcyber7@gmail.com") {
      return new Response(
        JSON.stringify({ error: "Cannot delete the primary owner account" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete related data in order
    // 1. Delete user's messages
    await supabaseAdmin.from("messages").delete().eq("sender_id", user_id);
    
    // 2. Delete user's message reactions
    await supabaseAdmin.from("message_reactions").delete().eq("user_id", user_id);
    
    // 3. Delete user's chat room memberships
    await supabaseAdmin.from("chat_room_members").delete().eq("user_id", user_id);
    
    // 4. Delete chat rooms created by user
    await supabaseAdmin.from("chat_rooms").delete().eq("created_by", user_id);
    
    // 5. Delete user's team memberships
    await supabaseAdmin.from("team_members").delete().eq("user_id", user_id);
    
    // 6. Delete teams created by user
    await supabaseAdmin.from("teams").delete().eq("created_by", user_id);
    
    // 7. Delete user's YouTube channels
    await supabaseAdmin.from("youtube_channels").delete().eq("user_id", user_id);
    
    // 8. Delete user's forum replies
    await supabaseAdmin.from("forum_replies").delete().eq("author_id", user_id);
    
    // 9. Delete user's forum threads
    await supabaseAdmin.from("forum_threads").delete().eq("author_id", user_id);
    
    // 10. Delete user's tasks (assigned_to and assigned_by)
    await supabaseAdmin.from("tasks").delete().eq("assigned_to", user_id);
    await supabaseAdmin.from("tasks").delete().eq("assigned_by", user_id);
    
    // 11. Delete user's resources
    await supabaseAdmin.from("resources").delete().eq("uploaded_by", user_id);
    
    // 12. Delete user's announcements
    await supabaseAdmin.from("announcements").delete().eq("created_by", user_id);
    
    // 13. Delete user's activity logs
    await supabaseAdmin.from("activity_logs").delete().eq("user_id", user_id);
    
    // 14. Delete user's badges
    await supabaseAdmin.from("user_badges").delete().eq("user_id", user_id);
    
    // 15. Delete user's points
    await supabaseAdmin.from("user_points").delete().eq("user_id", user_id);
    
    // 16. Delete user's workspace memberships
    await supabaseAdmin.from("workspace_members").delete().eq("user_id", user_id);
    
    // 17. Delete workspaces owned by user
    await supabaseAdmin.from("workspaces").delete().eq("owner_id", user_id);
    
    // 18. Delete user's role
    await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id);
    
    // 19. Delete user's profile
    const { error: profileDeleteError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("user_id", user_id);

    if (profileDeleteError) {
      console.error("Error deleting profile:", profileDeleteError);
      return new Response(
        JSON.stringify({ error: "Failed to delete user profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 20. Delete user from auth.users (this permanently removes the user)
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id);

    if (authDeleteError) {
      console.error("Error deleting auth user:", authDeleteError);
      return new Response(
        JSON.stringify({ error: "Failed to delete auth user: " + authDeleteError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`User ${user_id} successfully deleted by admin ${callingUser.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User permanently deleted from the system" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in delete-user function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
