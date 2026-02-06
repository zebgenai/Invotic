import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useChatEnabled } from '@/hooks/useAppSettings';
import {
  LayoutDashboard,
  Users,
  Youtube,
  CheckSquare,
  MessageCircle,
  Megaphone,
  BarChart3,
  Trophy,
  BookOpen,
  MessageSquare,
  Settings,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  UsersRound,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
  const { profile, role, signOut } = useAuth();
  const { chatEnabled } = useChatEnabled();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isAdmin = role === 'admin';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleNavClick = () => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const adminItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'User Management', path: '/dashboard/users' },
    { icon: Shield, label: 'KYC Review', path: '/dashboard/kyc' },
    { icon: UsersRound, label: 'Teams', path: '/dashboard/teams' },
    { icon: Youtube, label: 'All Channels', path: '/dashboard/channels' },
    { icon: CheckSquare, label: 'All Tasks', path: '/dashboard/tasks' },
    { icon: MessageCircle, label: 'Chat Rooms', path: '/dashboard/chat' },
    { icon: MessageCircle, label: 'Discord', path: '/dashboard/discord' },
    { icon: Megaphone, label: 'Announcements', path: '/dashboard/announcements' },
    { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
  ];

  const managerItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Team', path: '/dashboard/team' },
    { icon: CheckSquare, label: 'Tasks', path: '/dashboard/tasks' },
    { icon: MessageCircle, label: 'Chat', path: '/dashboard/chat' },
    { icon: Youtube, label: 'Channels', path: '/dashboard/channels' },
  ];

  const kycPendingItems = [
    { icon: FileCheck, label: 'KYC Verification', path: '/dashboard/kyc-submit' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  const userItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileCheck, label: 'KYC Status', path: '/dashboard/kyc-submit' },
    { icon: Youtube, label: 'My Channel', path: '/dashboard/channel' },
    { icon: CheckSquare, label: 'Tasks', path: '/dashboard/tasks' },
    { icon: MessageCircle, label: 'Chat', path: '/dashboard/chat' },
    { icon: BarChart3, label: 'Stats', path: '/dashboard/stats' },
  ];

  const commonItems = [
    { icon: Trophy, label: 'Leaderboard', path: '/dashboard/leaderboard' },
    { icon: BookOpen, label: 'Resources', path: '/dashboard/resources' },
    { icon: MessageSquare, label: 'Forum', path: '/dashboard/forum' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  const isKycApproved = profile?.kyc_status === 'approved';

  const getNavItems = () => {
    let items: typeof adminItems = [];
    
    if (role === 'admin') {
      items = [...adminItems, ...commonItems];
    } else if (role === 'manager') {
      items = [...managerItems, ...commonItems];
    } else if (!isKycApproved) {
      items = kycPendingItems;
    } else {
      items = [...userItems, ...commonItems];
    }
    
    // Filter out chat if disabled for non-admin users
    if (!chatEnabled && !isAdmin) {
      items = items.filter(item => item.path !== '/dashboard/chat');
    }
    
    return items;
  };

  const navItems = getNavItems();

  const getKycBadge = () => {
    if (!profile) return null;
    
    switch (profile.kyc_status) {
      case 'approved':
        return <Badge className="badge-success text-xs">Verified</Badge>;
      case 'pending':
        return <Badge className="badge-warning text-xs">Pending</Badge>;
      case 'rejected':
        return <Badge className="badge-error text-xs">Rejected</Badge>;
      default:
        return null;
    }
  };

  // On mobile, show/hide based on mobileOpen prop
  // On desktop, always visible
  const isVisible = isMobile ? mobileOpen : true;

  if (!isVisible) return null;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50',
        isMobile ? 'w-72 animate-slide-in-right' : (collapsed ? 'w-20' : 'w-64')
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className={cn('flex items-center', (isMobile || !collapsed) ? 'justify-between' : 'justify-center')}>
          <div className={cn('flex items-center', (collapsed && !isMobile) ? '' : 'gap-3')}>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-lg">P</span>
            </div>
            {(!collapsed || isMobile) && (
              <div>
                <h1 className="font-display font-bold text-foreground">Partnerunityx</h1>
                <p className="text-xs text-muted-foreground capitalize">{role} Dashboard</p>
              </div>
            )}
          </div>
          {isMobile && onMobileClose && (
            <Button variant="ghost" size="icon" onClick={onMobileClose}>
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            onClick={handleNavClick}
            className={({ isActive }) =>
              cn(
                'sidebar-item',
                isActive && 'active',
                (collapsed && !isMobile) && 'justify-center px-3'
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {(!collapsed || isMobile) && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-sidebar-border">
        <div className={cn('flex items-center gap-3', (collapsed && !isMobile) && 'flex-col')}>
          <Avatar className="w-10 h-10">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {profile?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          {(!collapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{profile?.full_name || 'User'}</p>
              <div className="flex items-center gap-2">
                {getKycBadge()}
              </div>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size={(collapsed && !isMobile) ? 'icon' : 'default'}
          className={cn('mt-3', (collapsed && !isMobile) ? 'w-full justify-center' : 'w-full justify-start')}
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
          {(!collapsed || isMobile) && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>

      {/* Collapse toggle - desktop only */}
      {!isMobile && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      )}
    </aside>
  );
};

export default Sidebar;
