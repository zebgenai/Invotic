import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import AuthPage from "./pages/Auth";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import UserManagement from "./pages/dashboard/UserManagement";
import ChannelStore from "./pages/dashboard/ChannelStore";
import TaskManagement from "./pages/dashboard/TaskManagement";
import Announcements from "./pages/dashboard/Announcements";
import Leaderboard from "./pages/dashboard/Leaderboard";
import Settings from "./pages/dashboard/Settings";

import Forum from "./pages/dashboard/Forum";
import Resources from "./pages/dashboard/Resources";
import Analytics from "./pages/dashboard/Analytics";
import KYCSubmission from "./pages/dashboard/KYCSubmission";
import TeamManagement from "./pages/dashboard/TeamManagement";
import DiscordChat from "./pages/dashboard/DiscordChat";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 5,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="partnerunityx-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="kyc" element={<UserManagement />} />
                <Route path="kyc-submit" element={<KYCSubmission />} />
                <Route path="team" element={<UserManagement />} />
                <Route path="channels" element={<ChannelStore />} />
                <Route path="channel" element={<ChannelStore />} />
                <Route path="tasks" element={<TaskManagement />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="settings" element={<Settings />} />
                
                <Route path="forum" element={<Forum />} />
                <Route path="resources" element={<Resources />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="stats" element={<Analytics />} />
                <Route path="teams" element={<TeamManagement />} />
                <Route path="discord" element={<DiscordChat />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
