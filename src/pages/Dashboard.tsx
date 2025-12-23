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
  Moon,
  Activity,
  Clock,
  ChevronRight,
  AlertCircle,
  Zap,
  Trophy,
  Droplets,
  Footprints,
  Timer,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
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
  { id: 1, type: "Workout", description: "Morning cardio session", time: "2 hours ago", icon: Dumbbell, color: "bg-health-coral" },
  { id: 2, type: "Skincare", description: "Evening routine completed", time: "5 hours ago", icon: Sparkles, color: "bg-health-purple" },
  { id: 3, type: "AI Consultation", description: "Nutrition advice received", time: "Yesterday", icon: Bot, color: "bg-health-teal" },
  { id: 4, type: "Workout", description: "Strength training", time: "Yesterday", icon: Dumbbell, color: "bg-health-blue" },
];

const todaySchedule = [
  { time: "7:00 AM", task: "Morning stretch routine", completed: true },
  { time: "12:00 PM", task: "Midday skincare check", completed: true },
  { time: "5:00 PM", task: "Evening workout", completed: false },
  { time: "9:00 PM", task: "Night skincare routine", completed: false },
];

const quickStats = [
  { label: "Steps Today", value: "8,432", target: "10,000", icon: Footprints, color: "health-teal", progress: 84 },
  { label: "Water Intake", value: "6", target: "8 glasses", icon: Droplets, color: "health-blue", progress: 75 },
  { label: "Active Minutes", value: "45", target: "60 min", icon: Timer, color: "health-coral", progress: 75 },
  { label: "Calories", value: "1,890", target: "2,200", icon: Flame, color: "health-purple", progress: 86 },
];

export default function Dashboard() {
  const [greeting, setGreeting] = useState("Good morning");
  const [quote, setQuote] = useState("");
  const [timeIcon, setTimeIcon] = useState<typeof Sun | typeof Moon>(Sun);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
      setTimeIcon(Sun);
    } else if (hour < 18) {
      setGreeting("Good afternoon");
      setTimeIcon(Sun);
    } else {
      setGreeting("Good evening");
      setTimeIcon(Moon);
    }

    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const TimeIcon = timeIcon;

  return (
    <AppLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Hero Section with Orbs */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden border-0 gradient-hero min-h-[200px]">
            {/* Floating orbs */}
            <div className="floating-orb w-64 h-64 bg-white/20 -top-20 -right-20" />
            <div className="floating-orb w-48 h-48 bg-white/15 -bottom-10 left-1/4 delay-500" />
            <div className="floating-orb w-32 h-32 bg-white/10 top-1/2 right-1/3 delay-300" />
            
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary-foreground/5" />
            <CardContent className="relative p-8 lg:p-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <TimeIcon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-medium text-primary-foreground/90">{greeting}</span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground font-display tracking-tight">
                    Welcome back, John! 
                    <span className="inline-block animate-bounce-subtle ml-2">👋</span>
                  </h1>
                  <p className="text-primary-foreground/80 max-w-lg text-lg italic">
                    "{quote}"
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <Badge className="bg-white/20 text-primary-foreground border-0 backdrop-blur px-3 py-1">
                      <Trophy className="h-3.5 w-3.5 mr-1.5" />
                      7 Day Streak
                    </Badge>
                    <Badge className="bg-white/20 text-primary-foreground border-0 backdrop-blur px-3 py-1">
                      <Zap className="h-3.5 w-3.5 mr-1.5" />
                      Level 12
                    </Badge>
                  </div>
                </div>
                <div className="hidden lg:flex items-center gap-4">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-3xl gradient-accent flex items-center justify-center animate-float shadow-lg">
                      <Heart className="h-14 w-14 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-10 w-10 rounded-xl bg-health-yellow flex items-center justify-center shadow-md animate-bounce-subtle">
                      <span className="text-foreground font-bold text-sm">95</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => (
              <Card 
                key={stat.label} 
                className={`stat-card bg-${stat.color}-light border-${stat.color}/20 group cursor-pointer`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`h-12 w-12 rounded-2xl bg-${stat.color}/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}`} />
                  </div>
                  <ArrowUpRight className={`h-4 w-4 text-${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-foreground font-display">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">/ {stat.target}</p>
                </div>
                <Progress value={stat.progress} className="h-1.5 mt-3" />
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Main Stats Cards */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="stat-card bg-health-teal-light border-health-teal/20">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Workouts This Week</p>
                  <p className="text-3xl font-bold text-foreground font-display">15</p>
                  <p className="text-xs text-health-teal flex items-center gap-1 mt-2">
                    <TrendingUp className="h-3.5 w-3.5" /> +12% from last week
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl gradient-bg flex items-center justify-center shadow-md">
                  <Dumbbell className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </Card>

            <Card className="stat-card bg-health-coral-light border-health-coral/20">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Calories Burned</p>
                  <p className="text-3xl font-bold text-foreground font-display">2,190</p>
                  <p className="text-xs text-health-coral flex items-center gap-1 mt-2">
                    <Flame className="h-3.5 w-3.5" /> 890 today
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl gradient-accent flex items-center justify-center shadow-md">
                  <Flame className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </Card>

            <Card className="stat-card bg-health-purple-light border-health-purple/20">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
                  <p className="text-3xl font-bold text-foreground font-display">7 days</p>
                  <p className="text-xs text-health-purple flex items-center gap-1 mt-2">
                    <Target className="h-3.5 w-3.5" /> Personal best!
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl gradient-purple flex items-center justify-center shadow-md">
                  <Target className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </Card>

            <Card className="stat-card bg-health-mint-light border-health-mint/20">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Skin Condition</p>
                  <p className="text-3xl font-bold text-foreground font-display">Good</p>
                  <p className="text-xs text-health-mint flex items-center gap-1 mt-2">
                    <Sparkles className="h-3.5 w-3.5" /> Improving
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-health-mint flex items-center justify-center shadow-md">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="h-full card-elevated">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 font-display">
                  <div className="h-8 w-8 rounded-xl gradient-bg flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary-foreground" />
                  </div>
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todaySchedule.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                      item.completed
                        ? "bg-health-green-light border border-health-green/20"
                        : "bg-muted/50 border border-border/50 hover:bg-muted"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full flex-shrink-0 transition-all ${
                        item.completed
                          ? "bg-health-green shadow-md"
                          : "border-2 border-muted-foreground/30"
                      }`}
                    >
                      {item.completed && (
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${item.completed ? "text-health-green" : "text-foreground"}`}>
                        {item.task}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="h-full card-elevated">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl gradient-accent flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary-foreground" />
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link to="/ai-consultant" className="block">
                    <div className="action-btn bg-health-teal-light group h-full">
                      <div className="h-14 w-14 rounded-2xl gradient-bg flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                        <Bot className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">AI Consultation</span>
                      <span className="text-xs text-muted-foreground">Get personalized advice</span>
                    </div>
                  </Link>
                  <Link to="/chatbot" className="block">
                    <div className="action-btn bg-health-blue-light group h-full">
                      <div className="h-14 w-14 rounded-2xl gradient-blue flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                        <MessageSquare className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">Chat with AI</span>
                      <span className="text-xs text-muted-foreground">24/7 wellness support</span>
                    </div>
                  </Link>
                  <Link to="/fitness" className="block">
                    <div className="action-btn bg-health-coral-light group h-full">
                      <div className="h-14 w-14 rounded-2xl gradient-sunset flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                        <Dumbbell className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">Log Workout</span>
                      <span className="text-xs text-muted-foreground">Track your progress</span>
                    </div>
                  </Link>
                  <Link to="/skincare" className="block">
                    <div className="action-btn bg-health-purple-light group h-full">
                      <div className="h-14 w-14 rounded-2xl gradient-purple flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                        <Sparkles className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">Track Skincare</span>
                      <span className="text-xs text-muted-foreground">Monitor your routine</span>
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
            <Card className="h-full card-elevated">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2 font-display">
                    <div className="h-8 w-8 rounded-xl gradient-bg flex items-center justify-center">
                      <Activity className="h-4 w-4 text-primary-foreground" />
                    </div>
                    Weekly Activity
                  </CardTitle>
                  <Link to="/analytics">
                    <Button variant="ghost" size="sm" className="text-xs group">
                      View All 
                      <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData}>
                      <defs>
                        <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(168, 76%, 42%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(168, 76%, 42%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
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
                          borderRadius: '16px',
                          boxShadow: 'var(--shadow-lg)',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="calories"
                        stroke="hsl(168, 76%, 42%)"
                        strokeWidth={3}
                        fill="url(#colorCalories)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <Card className="h-full card-elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl gradient-purple flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary-foreground" />
                  </div>
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all duration-300 group cursor-pointer"
                  >
                    <div className={`h-11 w-11 rounded-xl ${activity.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <activity.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{activity.description}</p>
                        <Badge variant="secondary" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Health Disclaimer */}
        <motion.div variants={itemVariants}>
          <Card className="border-health-yellow/40 bg-gradient-to-r from-health-yellow-light to-health-coral-light/30">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-health-yellow/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-health-yellow" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Health Disclaimer</p>
                  <p className="text-sm text-muted-foreground mt-1">
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
