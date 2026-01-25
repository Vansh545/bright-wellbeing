import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, User, PlayCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PillTabs, PillTabsContent } from "@/components/ui/pill-tabs";
import { VideoTutorialSection } from "@/components/VideoTutorialSection";
import { PersonalProfileSetup } from "@/components/fitness/PersonalProfileSetup";
import { FitnessWorkoutsTab } from "@/components/fitness/FitnessWorkoutsTab";

const fitnessVideos = [
  {
    id: "1",
    title: "Full Body HIIT Workout",
    description: "High-intensity interval training for maximum calorie burn in minimum time.",
    duration: "25 min",
    difficulty: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/embed/ml6cT4AZdqI",
  },
  {
    id: "2",
    title: "Strength Training Basics",
    description: "Learn proper form and technique for fundamental strength exercises.",
    duration: "35 min",
    difficulty: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/embed/U0bhE67HuDY",
  },
  {
    id: "3",
    title: "Morning Yoga Flow",
    description: "Start your day with this energizing yoga sequence to wake up your body and mind.",
    duration: "20 min",
    difficulty: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/embed/v7AYKMP6rOE",
  },
  {
    id: "4",
    title: "Post-Workout Stretching",
    description: "Essential stretches to improve flexibility and prevent injury after exercise.",
    duration: "10 min",
    difficulty: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/embed/L_xrDAtykMI",
  },
];

const tabs = [
  { id: "workouts", label: "Workouts", icon: Dumbbell },
  { id: "profile", label: "Profile Setup", icon: User },
  { id: "tutorials", label: "Tutorials", icon: PlayCircle },
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
              <VideoTutorialSection title="Fitness Tutorials" videos={fitnessVideos} />
            </PillTabsContent>
          )}
        </AnimatePresence>
      </motion.div>
    </AppLayout>
  );
}
