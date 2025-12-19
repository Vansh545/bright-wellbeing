import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Bot,
  AlertCircle,
  User,
  Activity,
  Heart,
  Sparkles,
  Brain,
  Loader2,
  Copy,
  Save,
  Share2,
  Clock,
  ChevronRight,
} from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const focusAreas = [
  { id: "fitness", label: "Fitness", icon: Activity },
  { id: "nutrition", label: "Nutrition", icon: Heart },
  { id: "skincare", label: "Skincare", icon: Sparkles },
  { id: "wellness", label: "General Wellness", icon: Brain },
  { id: "mental", label: "Mental Health", icon: Brain },
];

const consultationHistory = [
  { id: 1, date: "Dec 15, 2024", topic: "Weight loss nutrition plan", focus: "Nutrition" },
  { id: 2, date: "Dec 12, 2024", topic: "Morning workout routine", focus: "Fitness" },
  { id: 3, date: "Dec 10, 2024", topic: "Anti-aging skincare tips", focus: "Skincare" },
];

export default function AIConsultant() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [focusArea, setFocusArea] = useState("fitness");
  
  const [profile, setProfile] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    fitnessLevel: "",
    healthGoals: "",
    medicalConditions: "",
    dietaryRestrictions: "",
  });

  const [query, setQuery] = useState("");

  const handleConsultation = async () => {
    if (!query.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter your health question.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('health-consultant', {
        body: {
          profile,
          query,
          focusArea,
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data.result);
      
      toast({
        title: "Consultation Complete",
        description: "Your personalized recommendations are ready.",
      });
    } catch (error) {
      console.error('Consultation error:', error);
      toast({
        title: "Consultation Failed",
        description: error instanceof Error ? error.message : "Failed to get AI consultation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast({ title: "Copied to clipboard" });
    }
  };

  const handleSave = () => {
    toast({ title: "Consultation saved", description: "Added to your history." });
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Health Disclaimer Banner */}
        <Card className="border-health-yellow/30 bg-health-yellow-light">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-health-yellow flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Important Health Notice</p>
                <p className="text-xs text-muted-foreground mt-1">
                  AI-generated health advice is for educational purposes only and should not replace
                  professional medical consultation. Always consult healthcare providers for medical decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Consultation History Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Consultation History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {consultationHistory.map((item) => (
                  <button
                    key={item.id}
                    className="w-full text-left p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs mb-1">
                        {item.focus}
                      </Badge>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">{item.topic}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Consultation Area */}
          <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
            {/* User Profile Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Your Health Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Personal Information</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="25"
                        value={profile.age}
                        onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                        className="input-focus"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={profile.gender}
                        onValueChange={(value) => setProfile({ ...profile, gender: value })}
                      >
                        <SelectTrigger className="input-focus">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="height">Height</Label>
                      <Input
                        id="height"
                        placeholder="5'10'' or 178cm"
                        value={profile.height}
                        onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                        className="input-focus"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight</Label>
                      <Input
                        id="weight"
                        placeholder="165 lbs or 75kg"
                        value={profile.weight}
                        onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                        className="input-focus"
                      />
                    </div>
                  </div>
                </div>

                {/* Fitness Profile */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Fitness Profile</h3>
                  <div className="grid lg:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fitnessLevel">Fitness Level</Label>
                      <Select
                        value={profile.fitnessLevel}
                        onValueChange={(value) => setProfile({ ...profile, fitnessLevel: value })}
                      >
                        <SelectTrigger className="input-focus">
                          <SelectValue placeholder="Select your level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="athlete">Athlete</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="healthGoals">Health Goals</Label>
                      <Textarea
                        id="healthGoals"
                        placeholder="E.g., Lose 10 pounds, build muscle, improve flexibility..."
                        value={profile.healthGoals}
                        onChange={(e) => setProfile({ ...profile, healthGoals: e.target.value })}
                        className="input-focus resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Medical Information</h3>
                  <div className="grid lg:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="medicalConditions">Medical Conditions</Label>
                      <Textarea
                        id="medicalConditions"
                        placeholder="Any relevant medical conditions or injuries..."
                        value={profile.medicalConditions}
                        onChange={(e) => setProfile({ ...profile, medicalConditions: e.target.value })}
                        className="input-focus resize-none"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                      <Textarea
                        id="dietaryRestrictions"
                        placeholder="E.g., vegetarian, gluten-free, allergies..."
                        value={profile.dietaryRestrictions}
                        onChange={(e) => setProfile({ ...profile, dietaryRestrictions: e.target.value })}
                        className="input-focus resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consultation Query */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Ask Your Question
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Focus Area Selection */}
                <div>
                  <Label className="mb-3 block">Focus Area</Label>
                  <RadioGroup
                    value={focusArea}
                    onValueChange={setFocusArea}
                    className="flex flex-wrap gap-3"
                  >
                    {focusAreas.map((area) => (
                      <div key={area.id}>
                        <RadioGroupItem
                          value={area.id}
                          id={area.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={area.id}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary hover:bg-muted"
                        >
                          <area.icon className="h-4 w-4" />
                          {area.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Query Input */}
                <div>
                  <Label htmlFor="query">Your Health Question</Label>
                  <Textarea
                    id="query"
                    placeholder="E.g., What's the best workout routine for building lean muscle while losing fat? Include nutrition recommendations..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="input-focus resize-none"
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleConsultation}
                  disabled={isLoading}
                  className="w-full"
                  variant="hero"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4" />
                      Get AI Consultation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Display */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        AI Recommendations
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                          <Copy className="h-4 w-4" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleSave}>
                          <Save className="h-4 w-4" />
                          Save
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="markdown-content prose prose-sm max-w-none">
                      <ReactMarkdown>{result}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
