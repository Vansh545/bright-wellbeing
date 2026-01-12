import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Dumbbell,
  Flame,
  Clock,
  Activity,
  Plus,
  Trash2,
  Download,
  Sparkles,
  Loader2,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { VideoTutorialSection } from "@/components/VideoTutorialSection";
import { CountUp } from "@/components/AnimatedCounter";

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

interface Workout {
  id: string;
  date: Date;
  type: string;
  duration: number;
  calories: number;
  notes: string;
}

const workoutTypes = [
  { value: "cardio", label: "Cardio", color: "bg-health-coral" },
  { value: "strength", label: "Strength", color: "bg-health-blue" },
  { value: "yoga", label: "Yoga", color: "bg-health-purple" },
  { value: "hiit", label: "HIIT", color: "bg-health-coral" },
  { value: "sports", label: "Sports", color: "bg-health-green" },
  { value: "walking", label: "Walking", color: "bg-health-mint" },
  { value: "other", label: "Other", color: "bg-muted-foreground" },
];

const initialWorkouts: Workout[] = [
  { id: "1", date: new Date(), type: "cardio", duration: 45, calories: 350, notes: "Morning run" },
  { id: "2", date: new Date(Date.now() - 86400000), type: "strength", duration: 60, calories: 280, notes: "Upper body day" },
  { id: "3", date: new Date(Date.now() - 172800000), type: "yoga", duration: 30, calories: 120, notes: "Relaxation session" },
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

export default function FitnessTracker() {
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts);
  const [date, setDate] = useState<Date>(new Date());
  const [workoutType, setWorkoutType] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [exercisePlan, setExercisePlan] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "type">("date");

  const totalWorkouts = workouts.length;
  const totalCalories = workouts.reduce((acc, w) => acc + w.calories, 0);
  const totalMinutes = workouts.reduce((acc, w) => acc + w.duration, 0);
  const mostFrequent = workouts.reduce((acc: Record<string, number>, w) => {
    acc[w.type] = (acc[w.type] || 0) + 1;
    return acc;
  }, {});
  const topWorkout = Object.entries(mostFrequent).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

  const handleAddWorkout = () => {
    if (!workoutType || !duration) {
      toast({
        title: "Missing Information",
        description: "Please fill in workout type and duration.",
        variant: "destructive",
      });
      return;
    }

    const newWorkout: Workout = {
      id: Date.now().toString(),
      date,
      type: workoutType,
      duration: parseInt(duration),
      calories: parseInt(calories) || 0,
      notes,
    };

    setWorkouts([newWorkout, ...workouts]);
    setWorkoutType("");
    setDuration("");
    setCalories("");
    setNotes("");
    setDate(new Date());

    toast({
      title: "Workout Logged!",
      description: "Your workout has been saved successfully.",
    });
  };

  const handleDeleteWorkout = (id: string) => {
    setWorkouts(workouts.filter((w) => w.id !== id));
    toast({ title: "Workout deleted" });
  };

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('personal-health-hub', {
        body: {
          fitness_level: 'intermediate',
          primary_goal: 'Build endurance and strength',
          weight_goal: '',
          workouts: workouts.map(w => ({
            date: format(new Date(w.date), 'yyyy-MM-dd'),
            type: w.type,
            duration_minutes: w.duration,
            calories: w.calories,
            notes: w.notes,
          })),
          skincare_routines: [],
          generate_exercise_plan: true,
          generate_skincare_tips: false,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const plan = data.exercise_plan || data.summary || `## Your Personalized Exercise Plan

Based on your ${workouts.length} logged workouts, here are your fitness metrics:

### Current Stats
- **Total Workouts**: ${data.fitness_metrics?.total_workouts || workouts.length}
- **Calories Burned**: ${data.fitness_metrics?.total_calories_burned || totalCalories}
- **Total Duration**: ${data.fitness_metrics?.total_duration_minutes || totalMinutes} minutes
- **Most Frequent**: ${data.fitness_metrics?.most_frequent_workout || topWorkout}

### Progress Insights
${(data.progress_insights || ['Keep up the great work!']).map((insight: string) => `- ${insight}`).join('\n')}

> Continue tracking your workouts for more personalized recommendations!`;

      setExercisePlan(plan);
      
      toast({
        title: "Plan Generated!",
        description: "Your AI exercise plan is ready.",
      });
    } catch (error) {
      console.error('Error generating plan:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate exercise plan.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Type", "Duration (min)", "Calories", "Notes"];
    const rows = workouts.map((w) => [
      format(new Date(w.date), "yyyy-MM-dd"),
      w.type,
      w.duration,
      w.calories,
      w.notes,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workouts.csv";
    a.click();
    toast({ title: "Workouts exported!" });
  };

  const sortedWorkouts = [...workouts].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return a.type.localeCompare(b.type);
  });

  const getTypeColor = (type: string) => {
    return workoutTypes.find((t) => t.value === type)?.color || "bg-muted-foreground";
  };

  return (
    <AppLayout>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
        >
          {[
            { label: "Total Workouts", value: totalWorkouts, icon: Dumbbell, bg: "bg-health-teal-light", iconBg: "bg-health-teal/10", iconColor: "text-health-teal" },
            { label: "Total Calories", value: totalCalories, icon: Flame, bg: "bg-health-coral-light", iconBg: "bg-health-coral/10", iconColor: "text-health-coral" },
            { label: "Total Time", value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`, icon: Clock, bg: "bg-health-blue-light", iconBg: "bg-health-blue/10", iconColor: "text-health-blue", isString: true },
            { label: "Most Frequent", value: topWorkout, icon: Activity, bg: "bg-health-purple-light", iconBg: "bg-health-purple/10", iconColor: "text-health-purple", isString: true },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Card className={`stat-card ${stat.bg} border-transparent hover:shadow-lg transition-shadow`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.isString ? stat.value : <CountUp end={stat.value as number} duration={1.5} />}
                    </p>
                  </div>
                  <motion.div 
                    className={`h-10 w-10 rounded-lg ${stat.iconBg} flex items-center justify-center`}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Workout Form */}
          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Plus className="h-5 w-5 text-primary" />
                  </motion.div>
                  Log Workout
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={(d) => d && setDate(d)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Label>Workout Type</Label>
                  <Select value={workoutType} onValueChange={setWorkoutType}>
                    <SelectTrigger className="input-focus">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {workoutTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div 
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      placeholder="45"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="input-focus"
                    />
                  </div>
                  <div>
                    <Label>Calories Burned</Label>
                    <Input
                      type="number"
                      placeholder="300"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      className="input-focus"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="How did it go?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input-focus resize-none"
                    rows={3}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button onClick={handleAddWorkout} className="w-full" variant="hero">
                      <Plus className="h-4 w-4" />
                      Log Workout
                    </Button>
                  </motion.div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleGeneratePlan}
                          disabled={isGeneratingPlan}
                        >
                          {isGeneratingPlan ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            >
                              <Sparkles className="h-4 w-4" />
                            </motion.div>
                          )}
                          Generate AI Exercise Plan
                        </Button>
                      </motion.div>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          Your AI Exercise Plan
                        </DialogTitle>
                      </DialogHeader>
                      {exercisePlan && (
                        <motion.div 
                          className="markdown-content"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <ReactMarkdown>{exercisePlan}</ReactMarkdown>
                        </motion.div>
                      )}
                    </DialogContent>
                  </Dialog>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Workout History */}
          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Workout History
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={sortBy} onValueChange={(v: "date" | "type") => setSortBy(v)}>
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">By Date</SelectItem>
                        <SelectItem value="type">By Type</SelectItem>
                      </SelectContent>
                    </Select>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button variant="outline" size="sm" onClick={handleExportCSV}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
                <AnimatePresence>
                  {sortedWorkouts.map((workout, index) => (
                    <motion.div
                      key={workout.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4, backgroundColor: "rgba(var(--muted), 0.5)" }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 transition-colors cursor-pointer"
                    >
                      <motion.div 
                        className={`h-10 w-10 rounded-lg ${getTypeColor(workout.type)} flex items-center justify-center`}
                        whileHover={{ rotate: 10 }}
                      >
                        <Dumbbell className="h-5 w-5 text-primary-foreground" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground capitalize">
                            {workout.type}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {workout.duration} min
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {format(new Date(workout.date), "MMM d")} • {workout.calories} cal
                          {workout.notes && ` • ${workout.notes}`}
                        </p>
                      </div>
                      <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteWorkout(workout.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Video Tutorials */}
        <motion.div variants={itemVariants}>
          <VideoTutorialSection title="Fitness Tutorials" videos={fitnessVideos} />
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}