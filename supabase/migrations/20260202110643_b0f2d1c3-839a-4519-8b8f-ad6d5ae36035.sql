-- Create message_reads table to track which users have read each message
CREATE TABLE public.message_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see who read messages in rooms they belong to
CREATE POLICY "Users can view message reads in their rooms"
ON public.message_reads
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.chat_room_members crm ON crm.room_id = m.room_id
    WHERE m.id = message_reads.message_id
    AND crm.user_id = auth.uid()
  )
);

-- Policy: Users can insert their own read receipts
CREATE POLICY "Users can insert their own read receipts"
ON public.message_reads
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Enable realtime for message_reads
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reads;

-- Create index for performance
CREATE INDEX idx_message_reads_message_id ON public.message_reads(message_id);
CREATE INDEX idx_message_reads_user_id ON public.message_reads(user_id);