import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Dumbbell,
  Flame,
  Clock,
  Activity,
  Plus,
  Trash2,
  Edit2,
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
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
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

      // Use the exercise plan from CodeWords, or fallback to summary
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="stat-card bg-health-teal-light border-health-teal/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Workouts</p>
                <p className="text-2xl font-bold text-foreground">{totalWorkouts}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-health-teal/10 flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-health-teal" />
              </div>
            </div>
          </Card>

          <Card className="stat-card bg-health-coral-light border-health-coral/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Calories</p>
                <p className="text-2xl font-bold text-foreground">{totalCalories.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-health-coral/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-health-coral" />
              </div>
            </div>
          </Card>

          <Card className="stat-card bg-health-blue-light border-health-blue/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Time</p>
                <p className="text-2xl font-bold text-foreground">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-health-blue/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-health-blue" />
              </div>
            </div>
          </Card>

          <Card className="stat-card bg-health-purple-light border-health-purple/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Most Frequent</p>
                <p className="text-2xl font-bold text-foreground capitalize">{topWorkout}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-health-purple/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-health-purple" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Workout Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Log Workout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
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
              </div>

              <div>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="How did it go?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-focus resize-none"
                  rows={3}
                />
              </div>

              <Button onClick={handleAddWorkout} className="w-full" variant="hero">
                <Plus className="h-4 w-4" />
                Log Workout
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleGeneratePlan}
                    disabled={isGeneratingPlan}
                  >
                    {isGeneratingPlan ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Generate AI Exercise Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Your AI Exercise Plan
                    </DialogTitle>
                  </DialogHeader>
                  {exercisePlan && (
                    <div className="markdown-content">
                      <ReactMarkdown>{exercisePlan}</ReactMarkdown>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Workout History */}
          <Card>
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
                  <Button variant="outline" size="sm" onClick={handleExportCSV}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
              {sortedWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className={cn("h-2 w-2 rounded-full", getTypeColor(workout.type))} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground capitalize">
                        {workout.type}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {workout.duration} min
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {workout.calories} cal
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(workout.date), "MMM d, yyyy")}
                      {workout.notes && ` • ${workout.notes}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteWorkout(workout.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </AppLayout>
  );
}
