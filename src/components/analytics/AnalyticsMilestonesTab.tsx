import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CountUp } from "@/components/AnimatedCounter";

const milestones = [
  { id: 1, name: "Total Workouts", current: 45, target: 50, unit: "workouts" },
  { id: 2, name: "Calories Burned", current: 12500, target: 15000, unit: "cal" },
  { id: 3, name: "Skincare Streak", current: 14, target: 21, unit: "days" },
  { id: 4, name: "Active Days", current: 18, target: 20, unit: "days" },
];

export function AnalyticsMilestonesTab() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Milestone Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {milestones.map((milestone, index) => {
              const progress = (milestone.current / milestone.target) * 100;
              return (
                <motion.div 
                  key={milestone.id} 
                  className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">{milestone.name}</p>
                    <p className="text-xs text-muted-foreground">
                      <CountUp end={milestone.current} duration={1.5} />/{milestone.target} {milestone.unit}
                    </p>
                  </div>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    style={{ originX: 0 }}
                  >
                    <Progress value={progress} className="h-2" />
                  </motion.div>
                  <p className="text-xs text-primary mt-1">{Math.round(progress)}% complete</p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
