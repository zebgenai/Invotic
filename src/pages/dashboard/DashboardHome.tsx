import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/hooks/useProfiles';
import { useTasks } from '@/hooks/useTasks';
import { useChannels } from '@/hooks/useChannels';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import StatCard from '@/components/dashboard/StatCard';
import {
  Users,
  CheckSquare,
  Youtube,
  Megaphone,
  TrendingUp,
  Clock,
  Star,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const DashboardHome: React.FC = () => {
  const { profile, role } = useAuth();
  const { data: profiles } = useProfiles();
  const { data: tasks } = useTasks();
  const { data: channels } = useChannels();
  const { data: announcements } = useAnnouncements();

  const pendingTasks = tasks?.filter((t) => t.status === 'todo' || t.status === 'in_progress') || [];
  const completedTasks = tasks?.filter((t) => t.status === 'completed') || [];
  const pendingKyc = profiles?.filter((p) => p.kyc_status === 'pending') || [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">
            {getGreeting()}, <span className="gradient-text">{profile?.full_name?.split(' ')[0]}</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your portal today.
          </p>
        </div>
        {profile?.kyc_status === 'pending' && (
          <Badge className="badge-warning self-start">
            <Clock className="w-3 h-3 mr-1" />
            KYC Pending Approval
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {role === 'admin' && (
          <>
            <StatCard
              title="Total Users"
              value={profiles?.length || 0}
              change="+12% from last month"
              changeType="positive"
              icon={<Users className="w-6 h-6" />}
            />
            <StatCard
              title="Pending KYC"
              value={pendingKyc.length}
              change={pendingKyc.length > 0 ? 'Needs attention' : 'All clear'}
              changeType={pendingKyc.length > 0 ? 'negative' : 'positive'}
              icon={<Clock className="w-6 h-6" />}
            />
          </>
        )}
        <StatCard
          title="Active Tasks"
          value={pendingTasks.length}
          change={`${completedTasks.length} completed`}
          changeType="neutral"
          icon={<CheckSquare className="w-6 h-6" />}
        />
        <StatCard
          title="Channels"
          value={channels?.length || 0}
          change="+5 new this week"
          changeType="positive"
          icon={<Youtube className="w-6 h-6" />}
        />
        <StatCard
          title="Announcements"
          value={announcements?.length || 0}
          change="Updated recently"
          changeType="neutral"
          icon={<Megaphone className="w-6 h-6" />}
        />
        {role === 'user' && (
          <StatCard
            title="Your Points"
            value="1,250"
            change="Level 3 Partner"
            changeType="positive"
            icon={<Star className="w-6 h-6" />}
          />
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="glass-card col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.due_date
                          ? `Due ${format(new Date(task.due_date), 'MMM d, yyyy')}`
                          : 'No due date'}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      task.priority === 'urgent'
                        ? 'badge-error'
                        : task.priority === 'high'
                        ? 'badge-warning'
                        : 'bg-secondary'
                    }
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No pending tasks. You're all caught up! 🎉
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" />
              Latest Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements?.slice(0, 4).map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-start gap-2">
                    {announcement.is_pinned && (
                      <Badge className="badge-info text-xs">Pinned</Badge>
                    )}
                  </div>
                  <h4 className="font-medium mt-1">{announcement.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(announcement.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              ))}
              {(!announcements || announcements.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  No announcements yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Admin */}
      {role === 'admin' && pendingKyc.length > 0 && (
        <Card className="glass-card border-warning/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <Clock className="w-5 h-5" />
              Pending KYC Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingKyc.slice(0, 6).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning font-bold">
                    {user.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardHome;
