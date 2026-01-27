import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/Auth";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import UserManagement from "./pages/dashboard/UserManagement";
import ChannelStore from "./pages/dashboard/ChannelStore";
import TaskManagement from "./pages/dashboard/TaskManagement";
import Announcements from "./pages/dashboard/Announcements";
import Leaderboard from "./pages/dashboard/Leaderboard";
import Settings from "./pages/dashboard/Settings";
import Chat from "./pages/dashboard/Chat";
import Forum from "./pages/dashboard/Forum";
import Resources from "./pages/dashboard/Resources";
import Analytics from "./pages/dashboard/Analytics";
import KYCSubmission from "./pages/dashboard/KYCSubmission";
import TeamManagement from "./pages/dashboard/TeamManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="creator-portal-theme">
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
                <Route path="chat" element={<Chat />} />
                <Route path="forum" element={<Forum />} />
                <Route path="resources" element={<Resources />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="stats" element={<Analytics />} />
                <Route path="teams" element={<TeamManagement />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
