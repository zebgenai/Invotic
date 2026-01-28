import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationsDropdown } from '@/components/layout/NotificationsDropdown';
import { cn } from '@/lib/utils';
import { Loader2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

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

  // Check if user needs KYC approval
  const isKycApproved = profile.kyc_status === 'approved';
  const isAdminOrManager = role === 'admin' || role === 'manager';
  const allowedPathsForPendingKyc = ['/dashboard/kyc-submit', '/dashboard/settings'];
  const currentPath = location.pathname;
  
  if (!isAdminOrManager && !isKycApproved && !allowedPathsForPendingKyc.includes(currentPath)) {
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
                <h2 className="font-semibold text-sm md:text-base">{profile?.full_name || 'User'}</h2>
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
