import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationsDropdown } from '@/components/layout/NotificationsDropdown';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardLayout: React.FC = () => {
  const { user, loading, profile, role } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Redirect to auth if not logged in (check immediately, no loading state needed)
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Show minimal skeleton while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="hidden md:block w-64 bg-card border-r border-border" />
        <div className="flex-1">
          <div className="h-14 border-b border-border bg-background/80 backdrop-blur-sm" />
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Check if user needs KYC approval (only when profile is loaded)
  const isKycApproved = profile?.kyc_status === 'approved';
  const isAdminOrManager = role === 'admin' || role === 'manager';
  const allowedPathsForPendingKyc = ['/dashboard/kyc-submit', '/dashboard/settings'];
  const currentPath = location.pathname;
  
  // Only redirect for KYC when profile is loaded
  if (profile && !isAdminOrManager && !isKycApproved && !allowedPathsForPendingKyc.includes(currentPath)) {
    return <Navigate to="/dashboard/kyc-submit" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        collapsed={isMobile ? false : sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          isMobile ? 'ml-0' : (sidebarCollapsed ? 'ml-20' : 'ml-64')
        )}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(true)}
                  className="md:hidden"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}
            <div>
                <p className="text-xs md:text-sm text-muted-foreground">Welcome back,</p>
                {profile ? (
                  <h2 className="font-semibold text-sm md:text-base">{profile.full_name || 'User'}</h2>
                ) : (
                  <Skeleton className="h-5 w-24" />
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <NotificationsDropdown />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
