import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Target,
  Trophy,
  Download,
  TrendingUp,
  Flame,
  Dumbbell,
  Sparkles,
  Award,
  Zap,
  Star,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { CountUp } from "@/components/AnimatedCounter";

const weeklyWorkouts = [
  { week: "Week 1", workouts: 3 },
  { week: "Week 2", workouts: 5 },
  { week: "Week 3", workouts: 4 },
  { week: "Week 4", workouts: 6 },
];

const monthlyCalories = [
  { month: "Sep", calories: 5200 },
  { month: "Oct", calories: 6800 },
  { month: "Nov", calories: 7500 },
  { month: "Dec", calories: 8100 },
];

const workoutDistribution = [
  { name: "Cardio", value: 35, color: "hsl(16, 85%, 60%)" },
  { name: "Strength", value: 30, color: "hsl(210, 80%, 55%)" },
  { name: "HIIT", value: 20, color: "hsl(270, 60%, 55%)" },
  { name: "Yoga", value: 15, color: "hsl(158, 60%, 45%)" },
];

const skinConditionData = [
  { date: "Week 1", condition: 3 },
  { date: "Week 2", condition: 3.5 },
  { date: "Week 3", condition: 4 },
  { date: "Week 4", condition: 4.2 },
];

const milestones = [
  { id: 1, name: "Total Workouts", current: 45, target: 50, unit: "workouts" },
  { id: 2, name: "Calories Burned", current: 12500, target: 15000, unit: "cal" },
  { id: 3, name: "Skincare Streak", current: 14, target: 21, unit: "days" },
  { id: 4, name: "Active Days", current: 18, target: 20, unit: "days" },
];

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

const motivationalInsights = [
  "You're 10% ahead of your weekly workout goal! Keep pushing! 💪",
  "Your skin condition has improved by 40% this month. Great consistency!",
  "You've burned 2,000 more calories this month compared to last month!",
];

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function Analytics() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("month");
  const [goals, setGoals] = useState({
    weight: "",
    weightDate: "",
    fitness: "",
    skincare: "",
  });

  const handleExport = (format: "pdf" | "csv") => {
    toast({
      title: `Report exported as ${format.toUpperCase()}`,
      description: "Your progress report has been downloaded.",
    });
  };

  return (
    <AppLayout>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
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
        </motion.div>

        {/* Goal Setting */}
        <motion.div variants={itemVariants}>
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
        </motion.div>

        {/* Charts Grid */}
        <motion.div 
          className="grid md:grid-cols-2 gap-6"
          variants={containerVariants}
        >
          {/* Weekly Workouts */}
          <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
            <Card className="hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  Workout Frequency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyWorkouts}>
                      <XAxis
                        dataKey="week"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="workouts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Monthly Calories */}
          <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
            <Card className="hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Flame className="h-4 w-4 text-health-coral" />
                  Calorie Burn Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyCalories}>
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="calories"
                        stroke="hsl(16, 85%, 60%)"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(16, 85%, 60%)' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Workout Distribution */}
          <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
            <Card className="hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Workout Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56 flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={workoutDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name} ${value}%`}
                      >
                        {workoutDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Skin Condition */}
          <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
            <Card className="hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-health-purple" />
                  Skin Condition Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={skinConditionData}>
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis hide domain={[0, 5]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="condition"
                        stroke="hsl(270, 60%, 55%)"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(270, 60%, 55%)' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Milestones */}
        <motion.div variants={itemVariants}>
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

        {/* Achievements */}
        <motion.div variants={itemVariants}>
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

        {/* Motivational Insights */}
        <motion.div variants={itemVariants}>
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
      </motion.div>
    </AppLayout>
  );
}