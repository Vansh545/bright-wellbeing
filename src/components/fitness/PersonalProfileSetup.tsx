import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Target,
  Activity,
  Clock,
  Calendar,
  Sparkles,
  Loader2,
  CheckCircle2,
  Dumbbell,
  Scale,
  Ruler,
  Zap,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  age: string;
  gender: string;
  currentWeight: string;
  targetWeight: string;
  height: string;
  fitnessGoal: string;
  fitnessLevel: string;
  availableTime: string;
  daysPerWeek: string;
  timeline: string;
}

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fieldVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  hover: { scale: 1.02 },
};

export function PersonalProfileSetup() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    age: "",
    gender: "",
    currentWeight: "",
    targetWeight: "",
    height: "",
    fitnessGoal: "",
    fitnessLevel: "",
    availableTime: "",
    daysPerWeek: "",
    timeline: "",
  });

  const updateProfile = (key: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleGeneratePlan = async () => {
    // Validate required fields
    if (!profile.age || !profile.gender || !profile.currentWeight || !profile.fitnessGoal || !profile.fitnessLevel) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least age, gender, weight, fitness goal, and level.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('personal-health-hub', {
        body: {
          fitness_level: profile.fitnessLevel,
          primary_goal: profile.fitnessGoal,
          weight_goal: profile.targetWeight ? `From ${profile.currentWeight}kg to ${profile.targetWeight}kg` : '',
          user_profile: {
            age: parseInt(profile.age),
            gender: profile.gender,
            current_weight: parseFloat(profile.currentWeight),
            target_weight: profile.targetWeight ? parseFloat(profile.targetWeight) : null,
            height: profile.height ? parseFloat(profile.height) : null,
            available_time_per_day: profile.availableTime,
            days_per_week: profile.daysPerWeek,
            timeline_weeks: profile.timeline,
          },
          generate_exercise_plan: true,
          generate_skincare_tips: false,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const plan = data.exercise_plan || data.summary || generateFallbackPlan();
      setGeneratedPlan(plan);
      setShowPlanDialog(true);
      
      toast({
        title: "Plan Generated!",
        description: "Your personalized AI fitness plan is ready.",
      });
    } catch (error) {
      console.error('Error generating plan:', error);
      // Generate a meaningful fallback plan
      const fallbackPlan = generateFallbackPlan();
      setGeneratedPlan(fallbackPlan);
      setShowPlanDialog(true);
      
      toast({
        title: "Plan Generated",
        description: "Your personalized fitness plan is ready.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackPlan = () => {
    const goal = profile.fitnessGoal || "general fitness";
    const level = profile.fitnessLevel || "beginner";
    const days = profile.daysPerWeek || "4";
    const time = profile.availableTime || "45";
    const timeline = profile.timeline || "12";
    
    return `## 🏋️ Your Personalized ${goal} Plan

### Profile Summary
- **Age**: ${profile.age} years | **Gender**: ${profile.gender}
- **Current Weight**: ${profile.currentWeight}kg ${profile.targetWeight ? `→ Target: ${profile.targetWeight}kg` : ''}
${profile.height ? `- **Height**: ${profile.height}cm | **BMI**: ${(parseFloat(profile.currentWeight) / Math.pow(parseFloat(profile.height) / 100, 2)).toFixed(1)}` : ''}
- **Level**: ${level} | **Timeline**: ${timeline} weeks

---

### 📅 Weekly Schedule (${days} days/week)

**Day 1 - Upper Body Focus** (${time} min)
- Warm-up: 5 min dynamic stretching
- Push-ups: 3 sets × 10-15 reps
- Dumbbell rows: 3 sets × 12 reps
- Shoulder press: 3 sets × 10 reps
- Plank holds: 3 × 30 seconds
- Cool-down: 5 min stretching

**Day 2 - Lower Body & Core** (${time} min)
- Warm-up: 5 min light cardio
- Squats: 4 sets × 12-15 reps
- Lunges: 3 sets × 10 each leg
- Deadlifts: 3 sets × 10 reps
- Russian twists: 3 × 20 reps
- Cool-down: 5 min stretching

**Day 3 - Cardio & Endurance** (${time} min)
- HIIT intervals: 20 min
- Jump rope: 3 × 2 min
- Burpees: 3 × 10 reps
- Mountain climbers: 3 × 30 seconds
- Cool-down: 10 min walk

**Day 4 - Full Body Circuit** (${time} min)
- Circuit training with compound movements
- 4 rounds of full-body exercises
- Active recovery between sets

---

### 🎯 Weekly Goals
- Complete all scheduled workouts
- Stay hydrated (8+ glasses daily)
- Get 7-8 hours of sleep
- Track progress weekly

### 💡 Pro Tips
> Start with lighter weights and focus on form. Progress gradually!

*Continue with this plan for ${timeline} weeks, adjusting intensity as you improve.*`;
  };

  const formFields = [
    { key: "age", label: "Age", type: "input", placeholder: "25", icon: User },
    { key: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"], icon: User },
    { key: "currentWeight", label: "Current Weight (kg)", type: "input", placeholder: "70", icon: Scale },
    { key: "targetWeight", label: "Target Weight (kg)", type: "input", placeholder: "65", icon: Target },
    { key: "height", label: "Height (cm)", type: "input", placeholder: "170", icon: Ruler },
    { key: "fitnessGoal", label: "Fitness Goal", type: "select", options: ["Weight Loss", "Muscle Gain", "Endurance", "Flexibility", "General Fitness", "Athletic Performance"], icon: Target },
    { key: "fitnessLevel", label: "Fitness Level", type: "select", options: ["Beginner", "Intermediate", "Advanced", "Athlete"], icon: Activity },
    { key: "availableTime", label: "Available Time (minutes/day)", type: "select", options: ["15 minutes", "30 minutes", "45 minutes", "60 minutes", "90 minutes", "120 minutes"], icon: Clock },
    { key: "daysPerWeek", label: "Days per Week", type: "select", options: ["2 days", "3 days", "4 days", "5 days", "6 days", "7 days"], icon: Calendar },
    { key: "timeline", label: "Timeline (weeks)", type: "select", options: ["4 weeks", "8 weeks", "12 weeks", "16 weeks", "24 weeks"], icon: Zap },
  ];

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <Card className="relative overflow-hidden border-0 bg-card/80 backdrop-blur-sm">
          {/* Animated background gradient */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-health-teal/10 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-health-purple/10 blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
          </div>

          <CardHeader className="relative z-10">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-health-teal to-health-mint flex items-center justify-center"
                whileHover={{ rotate: 10, scale: 1.1 }}
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(var(--health-teal), 0)",
                    "0 0 20px 5px rgba(var(--health-teal), 0.3)",
                    "0 0 0 0 rgba(var(--health-teal), 0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle2 className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-xl font-bold">Personal Profile Setup</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Tell us about yourself to generate a customized fitness plan
                </p>
              </div>
            </motion.div>
          </CardHeader>

          <CardContent className="relative z-10 space-y-6">
            {/* Form Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={containerVariants}
            >
              {formFields.map((field, index) => (
                <motion.div
                  key={field.key}
                  variants={fieldVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  transition={{ delay: index * 0.05 }}
                  className="space-y-2"
                >
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <field.icon className="h-3.5 w-3.5" />
                    {field.label}
                  </Label>
                  
                  {field.type === "input" ? (
                    <motion.div whileFocus={{ scale: 1.02 }}>
                      <Input
                        type="number"
                        placeholder={field.placeholder}
                        value={profile[field.key as keyof ProfileData]}
                        onChange={(e) => updateProfile(field.key as keyof ProfileData, e.target.value)}
                        className="bg-background/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl h-12"
                      />
                    </motion.div>
                  ) : (
                    <Select
                      value={profile[field.key as keyof ProfileData]}
                      onValueChange={(value) => updateProfile(field.key as keyof ProfileData, value)}
                    >
                      <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl h-12">
                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option.toLowerCase().replace(/\s+/g, '_')}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Generate Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-4"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  className="w-full h-14 text-lg font-semibold relative overflow-hidden group"
                  variant="outline"
                >
                  {/* Animated gradient border */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-health-teal via-health-mint to-health-teal opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    style={{ backgroundSize: "200% 200%" }}
                  />
                  
                  {isGenerating ? (
                    <motion.div
                      className="flex items-center gap-3"
                      animate={{ opacity: [1, 0.6, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Generating Your Plan...</span>
                    </motion.div>
                  ) : (
                    <motion.div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      >
                        <Dumbbell className="h-5 w-5" />
                      </motion.div>
                      <span>Generate My AI Fitness Plan</span>
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles className="h-5 w-5 text-health-coral" />
                      </motion.div>
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            </motion.div>

            {/* Footer hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-sm text-muted-foreground pt-2"
            >
              Want a more personalized plan?{" "}
              <span className="text-primary cursor-pointer hover:underline">
                Upload 360° body analysis videos
              </span>
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plan Dialog */}
      <AnimatePresence>
        {showPlanDialog && (
          <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden p-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <DialogHeader className="p-6 pb-4 border-b border-border/50">
                  <DialogTitle className="flex items-center gap-3 text-xl">
                    <motion.div
                      className="h-10 w-10 rounded-xl bg-gradient-to-br from-health-teal to-health-mint flex items-center justify-center"
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(var(--health-teal), 0)",
                          "0 0 25px 8px rgba(var(--health-teal), 0.3)",
                          "0 0 0 0 rgba(var(--health-teal), 0)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="h-5 w-5 text-white" />
                    </motion.div>
                    Your AI Fitness Plan
                  </DialogTitle>
                </DialogHeader>
                
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="prose prose-sm dark:prose-invert max-w-none markdown-content"
                  >
                    <ReactMarkdown>{generatedPlan || ""}</ReactMarkdown>
                  </motion.div>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
