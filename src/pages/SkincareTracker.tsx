import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, User, PlayCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PillTabs, PillTabsContent } from "@/components/ui/pill-tabs";
import { VideoTutorialSection } from "@/components/VideoTutorialSection";
import { SkincareProfileSetup } from "@/components/skincare/SkincareProfileSetup";
import { SkincareRoutineTab } from "@/components/skincare/SkincareRoutineTab";

const skincareVideos = [
  {
    id: "1",
    title: "Complete Skincare Routine",
    description: "Step-by-step guide to building an effective morning and evening skincare routine.",
    duration: "15 min",
    difficulty: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/embed/OrElyY7MFVs",
  },
  {
    id: "2",
    title: "Anti-Aging Skincare Tips",
    description: "Expert advice on preventing and reducing signs of aging with the right products.",
    duration: "12 min",
    difficulty: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/embed/1TU_1hxqGJY",
  },
];

const tabs = [
  { id: "routine", label: "Routine", icon: Sparkles },
  { id: "profile", label: "Profile Setup", icon: User },
  { id: "tutorials", label: "Tutorials", icon: PlayCircle },
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
              <VideoTutorialSection title="Skincare Tutorials" videos={skincareVideos} />
            </PillTabsContent>
          )}
        </AnimatePresence>
      </motion.div>
    </AppLayout>
  );
}
