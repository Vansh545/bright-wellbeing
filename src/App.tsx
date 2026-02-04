import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import AIConsultant from "./pages/AIConsultant";
import Chatbot from "./pages/Chatbot";
import FitnessTracker from "./pages/FitnessTracker";
import HealthTracking from "./pages/HealthTracking";
import SkincareTracker from "./pages/SkincareTracker";
import Analytics from "./pages/Analytics";
import DeviceImport from "./pages/DeviceImport";
import Settings from "./pages/Settings";
import Install from "./pages/Install";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/install" element={<Install />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/ai-consultant" element={<ProtectedRoute><AIConsultant /></ProtectedRoute>} />
            <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
            <Route path="/fitness" element={<ProtectedRoute><FitnessTracker /></ProtectedRoute>} />
            <Route path="/health-tracking" element={<ProtectedRoute><HealthTracking /></ProtectedRoute>} />
            <Route path="/skincare" element={<ProtectedRoute><SkincareTracker /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/import" element={<ProtectedRoute><DeviceImport /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
