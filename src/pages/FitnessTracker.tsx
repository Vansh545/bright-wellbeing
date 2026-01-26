import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, User, PlayCircle, Bookmark } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PillTabs, PillTabsContent } from "@/components/ui/pill-tabs";
import { PersonalProfileSetup } from "@/components/fitness/PersonalProfileSetup";
import { FitnessWorkoutsTab } from "@/components/fitness/FitnessWorkoutsTab";
import { VideoTutorialTab } from "@/components/videos/VideoTutorialTab";
import { SavedVideosSection } from "@/components/videos/SavedVideosSection";

const tabs = [
  { id: "workouts", label: "Workouts", icon: Dumbbell },
  { id: "profile", label: "Profile Setup", icon: User },
  { id: "tutorials", label: "Tutorials", icon: PlayCircle },
  { id: "saved", label: "Saved Videos", icon: Bookmark },
];

export default function FitnessTracker() {
  const [activeTab, setActiveTab] = useState("workouts");

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
            <h1 className="text-2xl font-bold text-foreground">Fitness Tracker</h1>
            <p className="text-muted-foreground">Track workouts, set goals, and monitor your progress</p>
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
          {activeTab === "workouts" && (
            <PillTabsContent key="workouts">
              <FitnessWorkoutsTab />
            </PillTabsContent>
          )}
          {activeTab === "profile" && (
            <PillTabsContent key="profile">
              <PersonalProfileSetup />
            </PillTabsContent>
          )}
          {activeTab === "tutorials" && (
            <PillTabsContent key="tutorials">
              <VideoTutorialTab category="fitness" title="Fitness Tutorials For You" />
            </PillTabsContent>
          )}
          {activeTab === "saved" && (
            <PillTabsContent key="saved">
              <SavedVideosSection category="fitness" />
            </PillTabsContent>
          )}
        </AnimatePresence>
      </motion.div>
    </AppLayout>
  );
}
