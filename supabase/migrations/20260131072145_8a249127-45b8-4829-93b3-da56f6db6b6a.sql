-- Add channel assignment to teams
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS channel_id uuid REFERENCES public.youtube_channels(id) ON DELETE SET NULL;

-- Add assigned role to team members (what role this member performs in the team)
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS assigned_role text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_teams_channel_id ON public.teams(channel_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON public.team_members(assigned_role);