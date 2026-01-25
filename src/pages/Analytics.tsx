import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Target,
  Trophy,
  Download,
  Zap,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PillTabs, PillTabsContent } from "@/components/ui/pill-tabs";
import { AnalyticsGoalsTab } from "@/components/analytics/AnalyticsGoalsTab";
import { AnalyticsChartsTab } from "@/components/analytics/AnalyticsChartsTab";
import { AnalyticsMilestonesTab } from "@/components/analytics/AnalyticsMilestonesTab";
import { AnalyticsAchievementsTab } from "@/components/analytics/AnalyticsAchievementsTab";

const tabs = [
  { id: "goals", label: "Goals", icon: Target },
  { id: "charts", label: "Charts", icon: BarChart3 },
  { id: "milestones", label: "Milestones", icon: Zap },
  { id: "achievements", label: "Achievements", icon: Trophy },
];

export default function Analytics() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("month");
  const [activeTab, setActiveTab] = useState("goals");

  const handleExport = (format: "pdf" | "csv") => {
    toast({
      title: `Report exported as ${format.toUpperCase()}`,
      description: "Your progress report has been downloaded.",
    });
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <motion.h1 
              className="text-2xl font-bold text-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Progress & Analytics
            </motion.h1>
            <motion.p 
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Track your health journey and achievements
            </motion.p>
          </div>
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">3 Months</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" onClick={() => handleExport("csv")}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Pill Tabs Navigation */}
        <PillTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "goals" && (
            <PillTabsContent key="goals">
              <AnalyticsGoalsTab />
            </PillTabsContent>
          )}
          {activeTab === "charts" && (
            <PillTabsContent key="charts">
              <AnalyticsChartsTab />
            </PillTabsContent>
          )}
          {activeTab === "milestones" && (
            <PillTabsContent key="milestones">
              <AnalyticsMilestonesTab />
            </PillTabsContent>
          )}
          {activeTab === "achievements" && (
            <PillTabsContent key="achievements">
              <AnalyticsAchievementsTab />
            </PillTabsContent>
          )}
        </AnimatePresence>
      </motion.div>
    </AppLayout>
  );
}
