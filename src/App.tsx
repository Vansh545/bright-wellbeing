import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AIConsultant from "./pages/AIConsultant";
import Chatbot from "./pages/Chatbot";
import FitnessTracker from "./pages/FitnessTracker";
import SkincareTracker from "./pages/SkincareTracker";
import Analytics from "./pages/Analytics";
import VideoTutorials from "./pages/VideoTutorials";
import DeviceImport from "./pages/DeviceImport";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ai-consultant" element={<AIConsultant />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/fitness" element={<FitnessTracker />} />
          <Route path="/skincare" element={<SkincareTracker />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/tutorials" element={<VideoTutorials />} />
          <Route path="/import" element={<DeviceImport />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
