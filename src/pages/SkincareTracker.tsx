import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, User, PlayCircle, Bookmark } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PillTabs, PillTabsContent } from "@/components/ui/pill-tabs";
import { SkincareProfileSetup } from "@/components/skincare/SkincareProfileSetup";
import { SkincareRoutineTab } from "@/components/skincare/SkincareRoutineTab";
import { VideoTutorialTab } from "@/components/videos/VideoTutorialTab";
import { SavedVideosSection } from "@/components/videos/SavedVideosSection";

const tabs = [
  { id: "routine", label: "Routine", icon: Sparkles },
  { id: "profile", label: "Profile Setup", icon: User },
  { id: "tutorials", label: "Tutorials", icon: PlayCircle },
  { id: "saved", label: "Saved Videos", icon: Bookmark },
];

export default function SkincareTracker() {
  const [activeTab, setActiveTab] = useState("routine");

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Skincare Tracker</h1>
            <p className="text-muted-foreground">Log routines, track conditions, and get AI recommendations</p>
          </div>
          
          {/* Pill Tabs Navigation */}
          <PillTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "routine" && (
            <PillTabsContent key="routine">
              <SkincareRoutineTab />
            </PillTabsContent>
          )}
          {activeTab === "profile" && (
            <PillTabsContent key="profile">
              <SkincareProfileSetup />
            </PillTabsContent>
          )}
          {activeTab === "tutorials" && (
            <PillTabsContent key="tutorials">
              <VideoTutorialTab category="skincare" title="Skincare Tutorials For You" />
            </PillTabsContent>
          )}
          {activeTab === "saved" && (
            <PillTabsContent key="saved">
              <SavedVideosSection category="skincare" />
            </PillTabsContent>
          )}
        </AnimatePresence>
      </motion.div>
    </AppLayout>
  );
}
