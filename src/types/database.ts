export type AppRole = 'admin' | 'manager' | 'user';
export type KycStatus = 'pending' | 'approved' | 'rejected';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  kyc_status: KycStatus;
  kyc_document_url: string | null;
  kyc_document_back_url: string | null;
  kyc_submitted_at: string | null;
  kyc_reviewed_at: string | null;
  kyc_reviewed_by: string | null;
  kyc_gmail: string | null;
  kyc_whatsapp: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  joined_at: string;
}

export interface YouTubeChannel {
  id: string;
  user_id: string;
  workspace_id: string | null;
  channel_name: string;
  channel_link: string;
  creator_name: string;
  description: string | null;
  subscriber_count: number | null;
  video_count: number | null;
  view_count: number | null;
  youtube_channel_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  workspace_id: string | null;
  assigned_to: string | null;
  assigned_by: string;
  title: string;
  description: string | null;
  link: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatRoom {
  id: string;
  name: string | null;
  workspace_id: string | null;
  is_group: boolean;
  is_broadcast: boolean;
  is_public: boolean;
  created_by: string;
  created_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string | null;
  file_url: string | null;
  file_type: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_by: string;
  is_pinned: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  points_required: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  updated_at: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  uploaded_by: string;
  workspace_id: string | null;
  created_at: string;
}

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  author_id: string;
  workspace_id: string | null;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ForumReply {
  id: string;
  thread_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}
