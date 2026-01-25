import { motion } from "framer-motion";
import {
  Trophy,
  Dumbbell,
  Star,
  Flame,
  Zap,
  Sparkles,
  Target,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const achievements = [
  { id: 1, name: "First Workout", icon: Dumbbell, unlocked: true, color: "bg-health-teal" },
  { id: 2, name: "5 Workouts", icon: Star, unlocked: true, color: "bg-health-coral" },
  { id: 3, name: "10 Workouts", icon: Flame, unlocked: true, color: "bg-health-purple" },
  { id: 4, name: "30-Day Streak", icon: Zap, unlocked: false, color: "bg-health-yellow" },
  { id: 5, name: "Skincare Pro", icon: Sparkles, unlocked: true, color: "bg-health-mint" },
  { id: 6, name: "Goal Crusher", icon: Target, unlocked: false, color: "bg-health-blue" },
  { id: 7, name: "Consistency King", icon: Trophy, unlocked: false, color: "bg-health-green" },
  { id: 8, name: "Wellness Warrior", icon: Award, unlocked: false, color: "bg-primary" },
];

export function AnalyticsAchievementsTab() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Trophy className="h-5 w-5 text-health-yellow" />
            </motion.div>
            Achievement Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 200,
                }}
                whileHover={achievement.unlocked ? { 
                  scale: 1.15, 
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.3 }
                } : {}}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all cursor-pointer ${
                  achievement.unlocked
                    ? "bg-muted/50"
                    : "bg-muted/20 opacity-50"
                }`}
              >
                <motion.div
                  className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    achievement.unlocked ? achievement.color : "bg-muted"
                  }`}
                  animate={achievement.unlocked ? {
                    boxShadow: [
                      "0 0 0 0 rgba(var(--primary), 0)",
                      "0 0 10px 3px rgba(var(--primary), 0.2)",
                      "0 0 0 0 rgba(var(--primary), 0)",
                    ],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <achievement.icon
                    className={`h-6 w-6 ${
                      achievement.unlocked ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                  />
                </motion.div>
                <p className="text-xs text-center font-medium">{achievement.name}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
