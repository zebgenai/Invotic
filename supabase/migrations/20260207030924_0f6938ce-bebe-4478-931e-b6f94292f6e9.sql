-- Drop all chat-related tables and their dependencies

-- First drop triggers on profiles table that reference chat functions
DROP TRIGGER IF EXISTS auto_add_to_public_rooms ON public.profiles;

-- Drop triggers on chat tables
DROP TRIGGER IF EXISTS add_existing_users_on_public_room_create ON public.chat_rooms;
DROP TRIGGER IF EXISTS add_existing_users_to_public_room ON public.chat_rooms;
DROP TRIGGER IF EXISTS auto_add_room_creator ON public.chat_rooms;

-- Drop tables in correct order (respecting foreign key dependencies)
DROP TABLE IF EXISTS public.message_reactions CASCADE;
DROP TABLE IF EXISTS public.message_reads CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.chat_room_members CASCADE;
DROP TABLE IF EXISTS public.chat_rooms CASCADE;

-- Drop chat-related functions
DROP FUNCTION IF EXISTS public.is_room_member(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_room_creator(uuid, uuid);
DROP FUNCTION IF EXISTS public.auto_add_room_creator();
DROP FUNCTION IF EXISTS public.auto_add_user_to_public_rooms();
DROP FUNCTION IF EXISTS public.add_existing_users_to_public_room();
DROP FUNCTION IF EXISTS public.add_existing_users_on_public_room_create();

-- Remove chat_enabled setting from app_settings
DELETE FROM public.app_settings WHERE key = 'chat_enabled';