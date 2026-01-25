import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const motivationalInsights = [
  "You're 10% ahead of your weekly workout goal! Keep pushing! 💪",
  "Your skin condition has improved by 40% this month. Great consistency!",
  "You've burned 2,000 more calories this month compared to last month!",
];

export function AnalyticsGoalsTab() {
  const [goals, setGoals] = useState({
    weight: "",
    weightDate: "",
    fitness: "",
    skincare: "",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Goal Setting */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Target className="h-5 w-5 text-primary" />
            </motion.div>
            Set Your Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <motion.div 
              className="space-y-2"
              whileHover={{ scale: 1.02 }}
            >
              <Label>Weight Goal</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Target weight"
                  value={goals.weight}
                  onChange={(e) => setGoals({ ...goals, weight: e.target.value })}
                  className="input-focus"
                />
                <Input
                  type="date"
                  value={goals.weightDate}
                  onChange={(e) => setGoals({ ...goals, weightDate: e.target.value })}
                  className="input-focus"
                />
              </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Label>Fitness Goal</Label>
              <Textarea
                placeholder="E.g., Run 5K in under 25 minutes"
                value={goals.fitness}
                onChange={(e) => setGoals({ ...goals, fitness: e.target.value })}
                className="input-focus resize-none"
                rows={2}
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Label>Skincare Goal</Label>
              <Textarea
                placeholder="E.g., Clear skin by end of month"
                value={goals.skincare}
                onChange={(e) => setGoals({ ...goals, skincare: e.target.value })}
                className="input-focus resize-none"
                rows={2}
              />
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-health-mint/5 hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Zap className="h-5 w-5 text-primary" />
            </motion.div>
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {motivationalInsights.map((insight, index) => (
              <motion.div 
                key={index} 
                className="p-4 rounded-lg bg-card/80 border border-border/50 hover:border-primary/30 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <p className="text-sm text-foreground">{insight}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
