-- Add deleted_for column to track users who deleted message for themselves
ALTER TABLE public.messages 
ADD COLUMN deleted_for uuid[] DEFAULT '{}';

-- Create index for faster filtering
CREATE INDEX idx_messages_deleted_for ON public.messages USING GIN(deleted_for);