-- Add policy to allow authenticated users to view profiles of other chat room members
CREATE POLICY "Users can view profiles of chat room members"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.chat_room_members crm1
    JOIN public.chat_room_members crm2 ON crm1.room_id = crm2.room_id
    WHERE crm1.user_id = auth.uid()
    AND crm2.user_id = profiles.user_id
  )
);