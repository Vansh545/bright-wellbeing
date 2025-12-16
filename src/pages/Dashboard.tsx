import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  MessageSquare,
  Dumbbell,
  Sparkles,
  TrendingUp,
  Flame,
  Target,
  Heart,
  Sun,
  Activity,
  Clock,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const motivationalQuotes = [
  "Your health is an investment, not an expense.",
  "Small steps every day lead to big results.",
  "Take care of your body. It's the only place you have to live.",
  "The groundwork for all happiness is good health.",
  "Wellness is the complete integration of body, mind, and spirit.",
];

const weeklyData = [
  { day: "Mon", workouts: 2, calories: 320 },
  { day: "Tue", workouts: 1, calories: 180 },
  { day: "Wed", workouts: 3, calories: 450 },
  { day: "Thu", workouts: 2, calories: 290 },
  { day: "Fri", workouts: 1, calories: 150 },
  { day: "Sat", workouts: 4, calories: 520 },
  { day: "Sun", workouts: 2, calories: 280 },
];

const recentActivities = [
  { id: 1, type: "Workout", description: "Morning cardio session", time: "2 hours ago", icon: Dumbbell },
  { id: 2, type: "Skincare", description: "Evening routine completed", time: "5 hours ago", icon: Sparkles },
  { id: 3, type: "AI Consultation", description: "Nutrition advice received", time: "Yesterday", icon: Bot },
  { id: 4, type: "Workout", description: "Strength training", time: "Yesterday", icon: Dumbbell },
  { id: 5, type: "Health Goal", description: "Weekly target achieved", time: "2 days ago", icon: Target },
];

const todaySchedule = [
  { time: "7:00 AM", task: "Morning stretch routine", completed: true },
  { time: "12:00 PM", task: "Midday skincare check", completed: true },
  { time: "5:00 PM", task: "Evening workout", completed: false },
  { time: "9:00 PM", task: "Night skincare routine", completed: false },
];

export default function Dashboard() {
  const [greeting, setGreeting] = useState("Good morning");
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <AppLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden border-0 gradient-hero">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary-foreground/10" />
            <CardContent className="relative p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-primary-foreground/80 mb-2">
                    <Sun className="h-5 w-5" />
                    <span className="text-sm font-medium">{greeting}</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-primary-foreground mb-2">
                    Welcome back, John! 👋
                  </h1>
                  <p className="text-primary-foreground/80 max-w-lg italic">
                    "{quote}"
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="h-24 w-24 rounded-full bg-primary-foreground/10 flex items-center justify-center animate-float">
                    <Heart className="h-12 w-12 text-primary-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="stat-card bg-health-teal-light border-health-teal/20">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Workouts This Week</p>
                  <p className="text-2xl font-bold text-foreground">15</p>
                  <p className="text-xs text-health-teal flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" /> +12% from last week
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-health-teal/10 flex items-center justify-center">
                  <Dumbbell className="h-5 w-5 text-health-teal" />
                </div>
              </div>
            </Card>

            <Card className="stat-card bg-health-coral-light border-health-coral/20">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Calories Burned</p>
                  <p className="text-2xl font-bold text-foreground">2,190</p>
                  <p className="text-xs text-health-coral flex items-center gap-1 mt-1">
                    <Flame className="h-3 w-3" /> 890 today
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-health-coral/10 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-health-coral" />
                </div>
              </div>
            </Card>

            <Card className="stat-card bg-health-purple-light border-health-purple/20">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
                  <p className="text-2xl font-bold text-foreground">7 days</p>
                  <p className="text-xs text-health-purple flex items-center gap-1 mt-1">
                    <Target className="h-3 w-3" /> Personal best!
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-health-purple/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-health-purple" />
                </div>
              </div>
            </Card>

            <Card className="stat-card bg-health-mint-light border-health-mint/20">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Skin Condition</p>
                  <p className="text-2xl font-bold text-foreground">Good</p>
                  <p className="text-xs text-health-mint flex items-center gap-1 mt-1">
                    <Sparkles className="h-3 w-3" /> Improving
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-health-mint/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-health-mint" />
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todaySchedule.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      item.completed
                        ? "bg-health-green-light"
                        : "bg-muted/50"
                    }`}
                  >
                    <div
                      className={`h-3 w-3 rounded-full ${
                        item.completed
                          ? "bg-health-green"
                          : "border-2 border-muted-foreground"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${item.completed ? "text-health-green" : "text-foreground"}`}>
                        {item.task}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <Link to="/ai-consultant">
                    <div className="action-btn bg-health-teal-light hover:bg-health-teal/20 group h-full">
                      <div className="h-12 w-12 rounded-xl bg-health-teal/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Bot className="h-6 w-6 text-health-teal" />
                      </div>
                      <span className="text-sm font-medium text-foreground">AI Consultation</span>
                    </div>
                  </Link>
                  <Link to="/chatbot">
                    <div className="action-btn bg-health-blue-light hover:bg-health-blue/20 group h-full">
                      <div className="h-12 w-12 rounded-xl bg-health-blue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageSquare className="h-6 w-6 text-health-blue" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Chat with AI</span>
                    </div>
                  </Link>
                  <Link to="/fitness">
                    <div className="action-btn bg-health-coral-light hover:bg-health-coral/20 group h-full">
                      <div className="h-12 w-12 rounded-xl bg-health-coral/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Dumbbell className="h-6 w-6 text-health-coral" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Log Workout</span>
                    </div>
                  </Link>
                  <Link to="/skincare">
                    <div className="action-btn bg-health-purple-light hover:bg-health-purple/20 group h-full">
                      <div className="h-12 w-12 rounded-xl bg-health-purple/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Sparkles className="h-6 w-6 text-health-purple" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Track Skincare</span>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly Fitness Trend */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Weekly Activity
                  </CardTitle>
                  <Link to="/analytics">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View All <ChevronRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <XAxis
                        dataKey="day"
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
                          boxShadow: 'var(--shadow-lg)',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Bar
                        dataKey="calories"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <activity.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{activity.description}</p>
                        <Badge variant="secondary" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Health Disclaimer */}
        <motion.div variants={itemVariants}>
          <Card className="border-health-yellow/30 bg-health-yellow-light">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-health-yellow flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Health Disclaimer</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This platform is for educational and informational purposes only. The AI-generated advice
                    should not replace professional medical consultation. Always consult with healthcare
                    professionals for medical decisions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
