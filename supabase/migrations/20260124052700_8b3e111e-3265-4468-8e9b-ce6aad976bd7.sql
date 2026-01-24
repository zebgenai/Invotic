-- Add Gmail and WhatsApp contact fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN kyc_gmail TEXT,
ADD COLUMN kyc_whatsapp TEXT;