import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  Plus,
  Trash2,
  Sun,
  Moon,
  Calendar,
  TrendingUp,
  Loader2,
  Camera,
  Target,
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VideoTutorialSection } from "@/components/VideoTutorialSection";

const skincareVideos = [
  {
    id: "1",
    title: "Complete Skincare Routine",
    description: "Step-by-step guide to building an effective morning and evening skincare routine.",
    duration: "15 min",
    difficulty: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/embed/OrElyY7MFVs",
  },
  {
    id: "2",
    title: "Anti-Aging Skincare Tips",
    description: "Expert advice on preventing and reducing signs of aging with the right products.",
    duration: "12 min",
    difficulty: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/embed/1TU_1hxqGJY",
  },
];
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface SkincareEntry {
  id: string;
  date: Date;
  routineType: string;
  products: string[];
  condition: string;
  notes: string;
}

const routineTypes = [
  { value: "morning", label: "Morning Routine", icon: Sun },
  { value: "evening", label: "Evening Routine", icon: Moon },
  { value: "weekly", label: "Weekly Treatment", icon: Calendar },
];

const skinConditions = [
  { value: "excellent", label: "Excellent", color: "text-health-green" },
  { value: "good", label: "Good", color: "text-health-teal" },
  { value: "fair", label: "Fair", color: "text-health-yellow" },
  { value: "needs-attention", label: "Needs Attention", color: "text-health-coral" },
];

const conditionTrend = [
  { date: "Mon", value: 4 },
  { date: "Tue", value: 3 },
  { date: "Wed", value: 4 },
  { date: "Thu", value: 4 },
  { date: "Fri", value: 5 },
  { date: "Sat", value: 5 },
  { date: "Sun", value: 4 },
];

const productUsage = [
  { name: "Cleanser", value: 14, color: "hsl(174, 72%, 40%)" },
  { name: "Moisturizer", value: 12, color: "hsl(158, 60%, 45%)" },
  { name: "Sunscreen", value: 10, color: "hsl(45, 90%, 55%)" },
  { name: "Serum", value: 8, color: "hsl(270, 60%, 55%)" },
  { name: "Toner", value: 6, color: "hsl(16, 85%, 60%)" },
];

const initialEntries: SkincareEntry[] = [
  { id: "1", date: new Date(), routineType: "morning", products: ["Cleanser", "Vitamin C", "Sunscreen"], condition: "good", notes: "Skin feeling hydrated" },
  { id: "2", date: new Date(Date.now() - 86400000), routineType: "evening", products: ["Double Cleanse", "Retinol", "Night Cream"], condition: "excellent", notes: "No irritation" },
  { id: "3", date: new Date(Date.now() - 172800000), routineType: "weekly", products: ["Exfoliant", "Face Mask"], condition: "good", notes: "Deep cleanse" },
];

export default function SkincareTracker() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<SkincareEntry[]>(initialEntries);
  const [routineType, setRoutineType] = useState("");
  const [products, setProducts] = useState("");
  const [condition, setCondition] = useState("");
  const [notes, setNotes] = useState("");
  const [isGeneratingTips, setIsGeneratingTips] = useState(false);
  const [skincareTips, setSkincareTips] = useState<string | null>(null);
  const [goals, setGoals] = useState({
    main: "Reduce fine lines and improve skin texture",
    hydration: "Maintain daily hydration levels",
    protection: "Consistent SPF usage",
  });

  const handleAddEntry = () => {
    if (!routineType || !condition) {
      toast({
        title: "Missing Information",
        description: "Please fill in routine type and skin condition.",
        variant: "destructive",
      });
      return;
    }

    const newEntry: SkincareEntry = {
      id: Date.now().toString(),
      date: new Date(),
      routineType,
      products: products.split(",").map((p) => p.trim()).filter(Boolean),
      condition,
      notes,
    };

    setEntries([newEntry, ...entries]);
    setRoutineType("");
    setProducts("");
    setCondition("");
    setNotes("");

    toast({
      title: "Routine Logged!",
      description: "Your skincare routine has been saved.",
    });
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
    toast({ title: "Entry deleted" });
  };

  const handleGetTips = async () => {
    setIsGeneratingTips(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('personal-health-hub', {
        body: {
          fitness_level: 'intermediate',
          primary_goal: goals.main,
          weight_goal: '',
          workouts: [],
          skincare_routines: entries.map(e => ({
            routine_type: e.routineType,
            products_used: e.products,
            skin_condition: e.condition,
            notes: e.notes,
          })),
          generate_exercise_plan: false,
          generate_skincare_tips: true,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Use the skincare recommendations from CodeWords, or fallback to summary
      const tips = data.skincare_recommendations || data.summary || `## Personalized Skincare Recommendations

Based on your ${entries.length} logged routines, here are my recommendations:

### Your Skincare Goals
- **Main Goal**: ${goals.main}
- **Hydration**: ${goals.hydration}
- **Protection**: ${goals.protection}

### Recommendations
${(data.progress_insights || ['Keep up your consistent skincare routine!']).map((insight: string) => `- ${insight}`).join('\n')}

> Continue tracking your routines for more personalized recommendations!`;

      setSkincareTips(tips);
      
      toast({
        title: "Tips Generated!",
        description: "Your AI skincare tips are ready.",
      });
    } catch (error) {
      console.error('Error getting tips:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to get skincare tips.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTips(false);
    }
  };

  const getConditionIcon = (type: string) => {
    const routine = routineTypes.find((r) => r.value === type);
    return routine?.icon || Sun;
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Skincare Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Log Routine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Routine Type</Label>
                <Select value={routineType} onValueChange={setRoutineType}>
                  <SelectTrigger className="input-focus">
                    <SelectValue placeholder="Select routine" />
                  </SelectTrigger>
                  <SelectContent>
                    {routineTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Products Used</Label>
                <Input
                  placeholder="Cleanser, Serum, Moisturizer..."
                  value={products}
                  onChange={(e) => setProducts(e.target.value)}
                  className="input-focus"
                />
                <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
              </div>

              <div>
                <Label>Skin Condition</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger className="input-focus">
                    <SelectValue placeholder="How's your skin?" />
                  </SelectTrigger>
                  <SelectContent>
                    {skinConditions.map((cond) => (
                      <SelectItem key={cond.value} value={cond.value}>
                        <span className={cond.color}>{cond.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="Any observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-focus resize-none"
                  rows={3}
                />
              </div>

              <Button onClick={handleAddEntry} className="w-full" variant="hero">
                <Plus className="h-4 w-4" />
                Save Routine
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleGetTips}
                disabled={isGeneratingTips}
              >
                {isGeneratingTips ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Get AI Skincare Tips
              </Button>
            </CardContent>
          </Card>

          {/* Charts and History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Condition Trend */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Skin Condition Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={conditionTrend}>
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
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Product Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={productUsage}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={60}
                          dataKey="value"
                        >
                          {productUsage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Goals */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Skincare Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-health-purple-light">
                  <p className="text-sm font-medium text-foreground">Main Goal</p>
                  <p className="text-xs text-muted-foreground">{goals.main}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-health-blue-light">
                    <p className="text-sm font-medium text-foreground">Hydration</p>
                    <p className="text-xs text-muted-foreground">{goals.hydration}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-health-yellow-light">
                    <p className="text-sm font-medium text-foreground">Protection</p>
                    <p className="text-xs text-muted-foreground">{goals.protection}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Before/After Placeholders */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Camera className="h-4 w-4 text-primary" />
                  Progress Photos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer">
                    <Camera className="h-8 w-8 mb-2" />
                    <span className="text-sm">Before Photo</span>
                  </div>
                  <div className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer">
                    <Camera className="h-8 w-8 mb-2" />
                    <span className="text-sm">After Photo</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Routine History */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Routine History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
                {entries.map((entry) => {
                  const Icon = getConditionIcon(entry.routineType);
                  const condStyle = skinConditions.find((c) => c.value === entry.condition);
                  return (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground capitalize">
                            {entry.routineType} Routine
                          </p>
                          <Badge variant="secondary" className={`text-xs ${condStyle?.color}`}>
                            {condStyle?.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {entry.products.map((product, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {product}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(entry.date), "MMM d, yyyy")}
                          {entry.notes && ` • ${entry.notes}`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Tips Display */}
        {skincareTips && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Skincare Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="markdown-content">
                  <ReactMarkdown>{skincareTips}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Video Tutorials Section */}
        <VideoTutorialSection 
          title="Skincare Tutorials" 
          videos={skincareVideos} 
        />
      </motion.div>
    </AppLayout>
  );
}
