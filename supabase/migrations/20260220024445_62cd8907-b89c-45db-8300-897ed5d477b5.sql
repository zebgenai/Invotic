
-- Create forum_reactions table for reactions on threads and replies
CREATE TABLE public.forum_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  thread_id uuid REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  reply_id uuid REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  -- Ensure a user can only react once with the same emoji per target
  UNIQUE(user_id, thread_id, emoji),
  UNIQUE(user_id, reply_id, emoji),
  -- Ensure exactly one target is set
  CONSTRAINT reaction_target_check CHECK (
    (thread_id IS NOT NULL AND reply_id IS NULL) OR
    (thread_id IS NULL AND reply_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.forum_reactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view reactions"
  ON public.forum_reactions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can add reactions"
  ON public.forum_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions"
  ON public.forum_reactions FOR DELETE
  USING (user_id = auth.uid());
