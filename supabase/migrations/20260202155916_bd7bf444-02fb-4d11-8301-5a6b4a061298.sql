-- Add UPDATE policy for message_reads to allow upsert operations
CREATE POLICY "Users can update their own read receipts" 
ON public.message_reads 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add unique constraint if not exists (needed for upsert with onConflict)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'message_reads_message_id_user_id_key'
  ) THEN
    ALTER TABLE public.message_reads 
    ADD CONSTRAINT message_reads_message_id_user_id_key UNIQUE (message_id, user_id);
  END IF;
END $$;