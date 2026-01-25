import { motion } from "framer-motion";
import { BarChart3, Dumbbell, Flame, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function AnalyticsChartsTab() {
  return (
    <motion.div 
      className="grid md:grid-cols-2 gap-6"
      variants={containerVariants}
      initial="initial"
      animate="animate"
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
  );
}
