import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationsDropdown } from '@/components/layout/NotificationsDropdown';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const { user, loading, profile, role } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Wait for profile to load before making KYC decisions
  // This prevents flash redirects and 404 errors on refresh
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Check if user needs KYC approval (only for regular users, not admins/managers)
  const isKycApproved = profile.kyc_status === 'approved';
  const isAdminOrManager = role === 'admin' || role === 'manager';
  const allowedPathsForPendingKyc = ['/dashboard/kyc-submit', '/dashboard/settings'];
  const currentPath = location.pathname;
  
  // Redirect non-approved users to KYC page if they try to access other sections
  if (!isAdminOrManager && !isKycApproved && !allowedPathsForPendingKyc.includes(currentPath)) {
    return <Navigate to="/dashboard/kyc-submit" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        )}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-3">
            <div>
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <h2 className="font-semibold">{profile?.full_name || 'User'}</h2>
            </div>
            <div className="flex items-center gap-2">
              <NotificationsDropdown />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
