import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Target,
  Droplets,
  Sun,
  Moon,
  Sparkles,
  Loader2,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Heart,
  Palette,
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

interface SkincareProfileData {
  age: string;
  gender: string;
  skinType: string;
  skinConcerns: string;
  currentRoutine: string;
  budget: string;
  lifestyle: string;
  allergies: string;
  climate: string;
  primaryGoal: string;
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

export function SkincareProfileSetup() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRoutine, setGeneratedRoutine] = useState<string | null>(null);
  const [showRoutineDialog, setShowRoutineDialog] = useState(false);
  const [profile, setProfile] = useState<SkincareProfileData>({
    age: "",
    gender: "",
    skinType: "",
    skinConcerns: "",
    currentRoutine: "",
    budget: "",
    lifestyle: "",
    allergies: "",
    climate: "",
    primaryGoal: "",
  });

  const updateProfile = (key: keyof SkincareProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerateRoutine = async () => {
    if (!profile.age || !profile.skinType || !profile.skinConcerns || !profile.primaryGoal) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least age, skin type, concerns, and primary goal.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('personal-health-hub', {
        body: {
          fitness_level: 'intermediate',
          primary_goal: `Skincare: ${profile.primaryGoal}. Concerns: ${profile.skinConcerns}. Skin type: ${profile.skinType}.`,
          weight_goal: '',
          user_profile: {
            age: parseInt(profile.age),
            gender: profile.gender,
            skin_type: profile.skinType,
            skin_concerns: profile.skinConcerns,
            current_routine: profile.currentRoutine,
            budget: profile.budget,
            lifestyle: profile.lifestyle,
            allergies: profile.allergies,
            climate: profile.climate,
          },
          skincare_routines: [
            {
              routine_type: 'Morning',
              products_used: ['Cleanser', 'Moisturizer', 'SPF'],
              skin_condition: 'Good',
              notes: `Profile: ${profile.skinType} skin, ${profile.skinConcerns}`,
            },
          ],
          generate_exercise_plan: false,
          generate_skincare_tips: true,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const routine = data.skincare_recommendations || data.summary || generateFallbackRoutine();
      setGeneratedRoutine(routine);
      setShowRoutineDialog(true);
      
      toast({
        title: "Routine Generated!",
        description: "Your personalized AI skincare routine is ready.",
      });
    } catch (error) {
      console.error('Error generating routine:', error);
      const fallbackRoutine = generateFallbackRoutine();
      setGeneratedRoutine(fallbackRoutine);
      setShowRoutineDialog(true);
      
      toast({
        title: "Routine Generated",
        description: "Your personalized skincare routine is ready.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackRoutine = () => {
    const skinType = profile.skinType || "normal";
    const concerns = profile.skinConcerns || "general maintenance";
    const goal = profile.primaryGoal || "healthy skin";
    const budget = profile.budget || "moderate";
    
    return `## ✨ Your Personalized Skincare Routine

### Profile Summary
- **Age**: ${profile.age} years | **Gender**: ${profile.gender || 'Not specified'}
- **Skin Type**: ${skinType}
- **Main Concerns**: ${concerns}
- **Primary Goal**: ${goal}
- **Budget**: ${budget}
${profile.allergies ? `- **Allergies/Sensitivities**: ${profile.allergies}` : ''}
${profile.climate ? `- **Climate**: ${profile.climate}` : ''}

---

### ☀️ Morning Routine (5-7 minutes)

**Step 1: Gentle Cleanser**
${skinType.includes('oily') ? '- Use a gel or foaming cleanser with salicylic acid' : skinType.includes('dry') ? '- Use a creamy, hydrating cleanser' : '- Use a gentle, pH-balanced cleanser'}
- Massage for 30-60 seconds, rinse with lukewarm water

**Step 2: Toner (Optional)**
- Apply hydrating toner to prep skin for serums
- Pat gently into damp skin

**Step 3: Serum**
${concerns.includes('aging') || concerns.includes('wrinkle') ? '- Vitamin C serum for antioxidant protection' : concerns.includes('acne') ? '- Niacinamide serum for oil control' : concerns.includes('dark') ? '- Vitamin C or Alpha Arbutin for brightening' : '- Hyaluronic acid for hydration'}

**Step 4: Moisturizer**
${skinType.includes('oily') ? '- Lightweight, oil-free gel moisturizer' : skinType.includes('dry') ? '- Rich, cream-based moisturizer' : '- Balanced lotion moisturizer'}

**Step 5: Sunscreen (Non-negotiable!)**
- SPF 30-50 broad spectrum
- Apply generously, reapply every 2 hours if outdoors

---

### 🌙 Evening Routine (7-10 minutes)

**Step 1: Double Cleanse**
- First: Oil cleanser or micellar water to remove makeup/SPF
- Second: Regular cleanser for deep clean

**Step 2: Exfoliate (2-3x per week)**
${skinType.includes('sensitive') ? '- Gentle enzyme exfoliant or PHA' : '- AHA/BHA exfoliant for smooth texture'}

**Step 3: Treatment Serum**
${concerns.includes('aging') ? '- Retinol (start with 0.25-0.5%)' : concerns.includes('acne') ? '- Salicylic acid or benzoyl peroxide spot treatment' : concerns.includes('pigment') || concerns.includes('dark') ? '- Tranexamic acid or Azelaic acid' : '- Peptide serum for skin health'}

**Step 4: Eye Cream**
- Apply gently with ring finger around orbital bone

**Step 5: Night Moisturizer**
- Richer formula than morning for overnight repair
${skinType.includes('dry') ? '- Consider adding facial oil on top' : ''}

---

### 📅 Weekly Treatments

**1-2x per Week:**
- Face mask (hydrating, clarifying, or brightening based on needs)
- Sheet mask for extra hydration boost

---

### 🎯 4-Week Goal Milestones

| Week | Focus | Expected Progress |
|------|-------|-------------------|
| 1 | Establish routine consistency | Skin adjusting |
| 2 | Add active ingredients slowly | Improved hydration |
| 3 | Full routine established | Clearer texture |
| 4 | Evaluate and adjust | Visible improvement |

---

### 💡 Pro Tips for ${skinType} Skin

> **Patch test** new products for 24-48 hours before full application.

- Stay hydrated: 8+ glasses of water daily
- Change pillowcases weekly
- Don't skip sunscreen on cloudy days
- Be patient - real results take 4-8 weeks

### ⚠️ Ingredients to Consider
${skinType.includes('sensitive') ? '- **Avoid**: Fragrance, essential oils, alcohol\n- **Embrace**: Centella, Aloe, Ceramides' : skinType.includes('oily') ? '- **Embrace**: Niacinamide, Salicylic Acid, Clay\n- **Use sparingly**: Heavy oils' : skinType.includes('dry') ? '- **Embrace**: Hyaluronic Acid, Squalane, Shea Butter\n- **Avoid**: Alcohol-based products' : '- **Embrace**: Balanced products for all skin types'}

*Consistency is key! Stick with this routine for at least 6-8 weeks to see results.*`;
  };

  const formFields = [
    { key: "age", label: "Age", type: "input", placeholder: "25", icon: User },
    { key: "gender", label: "Gender", type: "select", options: ["Female", "Male", "Other"], icon: User },
    { key: "skinType", label: "Skin Type", type: "select", options: ["Oily", "Dry", "Combination", "Normal", "Sensitive", "Oily & Sensitive", "Dry & Sensitive"], icon: Droplets },
    { key: "skinConcerns", label: "Main Concerns", type: "select", options: ["Acne & Breakouts", "Aging & Wrinkles", "Dark Spots & Hyperpigmentation", "Dryness & Dehydration", "Oiliness & Large Pores", "Redness & Rosacea", "Dullness & Uneven Texture", "Sensitivity & Irritation"], icon: AlertCircle },
    { key: "primaryGoal", label: "Primary Goal", type: "select", options: ["Clear Skin", "Anti-Aging", "Brightening", "Hydration", "Oil Control", "Calm & Soothe", "Even Skin Tone", "General Maintenance"], icon: Target },
    { key: "currentRoutine", label: "Current Routine", type: "select", options: ["None / Minimal", "Basic (Cleanser + Moisturizer)", "Intermediate (3-5 products)", "Advanced (6+ products)"], icon: Calendar },
    { key: "budget", label: "Monthly Budget", type: "select", options: ["Budget-Friendly ($20-50)", "Moderate ($50-100)", "Premium ($100-200)", "Luxury ($200+)"], icon: Heart },
    { key: "lifestyle", label: "Lifestyle", type: "select", options: ["Indoor / Office Work", "Active / Outdoor", "Mixed / Varied", "Travel Frequently"], icon: Sun },
    { key: "climate", label: "Climate", type: "select", options: ["Hot & Humid", "Hot & Dry", "Cold & Dry", "Temperate", "Tropical", "Variable/Seasonal"], icon: Moon },
    { key: "allergies", label: "Allergies / Sensitivities", type: "input", placeholder: "e.g., Fragrance, Niacinamide...", icon: Palette },
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
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-health-purple/15 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-health-coral/10 blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-health-mint/10 blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
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
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-health-purple to-health-coral flex items-center justify-center"
                whileHover={{ rotate: 10, scale: 1.1 }}
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(168, 85, 247, 0)",
                    "0 0 20px 5px rgba(168, 85, 247, 0.3)",
                    "0 0 0 0 rgba(168, 85, 247, 0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-xl font-bold">Skincare Profile Setup</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Tell us about your skin to generate a customized routine
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
                        type={field.key === "age" ? "number" : "text"}
                        placeholder={field.placeholder}
                        value={profile[field.key as keyof SkincareProfileData]}
                        onChange={(e) => updateProfile(field.key as keyof SkincareProfileData, e.target.value)}
                        className="bg-background/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl h-12"
                      />
                    </motion.div>
                  ) : (
                    <Select
                      value={profile[field.key as keyof SkincareProfileData]}
                      onValueChange={(value) => updateProfile(field.key as keyof SkincareProfileData, value)}
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
                  onClick={handleGenerateRoutine}
                  disabled={isGenerating}
                  className="w-full h-14 text-lg font-semibold relative overflow-hidden group"
                  variant="outline"
                >
                  {/* Animated gradient border */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-health-purple via-health-coral to-health-purple opacity-0 group-hover:opacity-10 transition-opacity duration-500"
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
                      <span>Generating Your Routine...</span>
                    </motion.div>
                  ) : (
                    <motion.div className="flex items-center gap-3">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 180, 360],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      >
                        <Droplets className="h-5 w-5" />
                      </motion.div>
                      <span>Generate My AI Skincare Routine</span>
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles className="h-5 w-5 text-health-purple" />
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
              Want product recommendations?{" "}
              <span className="text-primary cursor-pointer hover:underline">
                Upload a selfie for AI skin analysis
              </span>
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Routine Dialog */}
      <AnimatePresence>
        {showRoutineDialog && (
          <Dialog open={showRoutineDialog} onOpenChange={setShowRoutineDialog}>
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
                      className="h-10 w-10 rounded-xl bg-gradient-to-br from-health-purple to-health-coral flex items-center justify-center"
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(168, 85, 247, 0)",
                          "0 0 25px 8px rgba(168, 85, 247, 0.3)",
                          "0 0 0 0 rgba(168, 85, 247, 0)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="h-5 w-5 text-white" />
                    </motion.div>
                    Your AI Skincare Routine
                  </DialogTitle>
                </DialogHeader>
                
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="prose prose-sm dark:prose-invert max-w-none markdown-content"
                  >
                    <ReactMarkdown>{generatedRoutine || ""}</ReactMarkdown>
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
