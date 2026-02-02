import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Target, 
  Activity, 
  Heart, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';

interface OnboardingWizardProps {
  onComplete: () => void;
}

const steps = [
  { id: 'welcome', title: 'Welcome', icon: Heart },
  { id: 'basics', title: 'About You', icon: User },
  { id: 'goals', title: 'Your Goals', icon: Target },
  { id: 'lifestyle', title: 'Lifestyle', icon: Activity },
  { id: 'interests', title: 'Interests', icon: Sparkles },
];

const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
const fitnessGoals = [
  { value: 'fat_loss', label: 'Lose Weight', emoji: '🔥' },
  { value: 'muscle_gain', label: 'Build Muscle', emoji: '💪' },
  { value: 'maintenance', label: 'Stay Fit', emoji: '⚡' },
  { value: 'general_health', label: 'Better Health', emoji: '❤️' },
  { value: 'flexibility', label: 'Improve Flexibility', emoji: '🧘' },
  { value: 'endurance', label: 'Build Endurance', emoji: '🏃' },
];
const activityLevels = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
  { value: 'light', label: 'Lightly Active', description: '1-3 days/week' },
  { value: 'moderate', label: 'Moderately Active', description: '3-5 days/week' },
  { value: 'active', label: 'Very Active', description: '6-7 days/week' },
  { value: 'athlete', label: 'Athlete', description: 'Professional training' },
];
const lifestylePreferences = [
  { value: 'busy', label: 'Busy', description: 'Short, efficient routines' },
  { value: 'moderate', label: 'Balanced', description: 'Mix of quick and longer sessions' },
  { value: 'relaxed', label: 'Flexible', description: 'Plenty of time for wellness' },
];
const interestOptions = [
  { value: 'fitness', label: 'Fitness & Workouts', emoji: '🏋️' },
  { value: 'nutrition', label: 'Nutrition', emoji: '🥗' },
  { value: 'mental_health', label: 'Mental Wellness', emoji: '🧠' },
  { value: 'skincare', label: 'Skincare', emoji: '✨' },
  { value: 'sleep', label: 'Sleep Quality', emoji: '😴' },
  { value: 'meditation', label: 'Meditation', emoji: '🧘' },
  { value: 'yoga', label: 'Yoga', emoji: '🙏' },
  { value: 'running', label: 'Running', emoji: '🏃' },
];

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    age_range: '',
    gender: '',
    height_cm: null as number | null,
    weight_kg: null as number | null,
    fitness_goal: 'general_health',
    activity_level: 'moderate',
    lifestyle_preference: 'moderate',
    interests: ['fitness', 'nutrition'] as string[],
  });
  const [saving, setSaving] = useState(false);
  
  const { saveProfile, initializeStreak } = useUserProfile();
  const { toast } = useToast();

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setSaving(true);
      await saveProfile({
        ...formData,
        onboarding_completed: true,
      });
      await initializeStreak();
      
      toast({
        title: 'Welcome aboard! 🎉',
        description: 'Your profile is set up. Let\'s start your wellness journey!',
      });
      
      onComplete();
    } catch (error) {
      toast({
        title: 'Setup failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6 py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="h-24 w-24 mx-auto rounded-3xl gradient-hero flex items-center justify-center"
            >
              <Heart className="h-12 w-12 text-primary-foreground" />
            </motion.div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold font-display">Welcome to Bright Wellbeing! 🌟</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Let's personalize your experience. This quick setup helps us understand 
                your goals so we can provide tailored recommendations.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              <span className="px-3 py-1 rounded-full bg-health-teal/10 text-health-teal text-sm">Smart Tracking</span>
              <span className="px-3 py-1 rounded-full bg-health-coral/10 text-health-coral text-sm">Personalized Tips</span>
              <span className="px-3 py-1 rounded-full bg-health-purple/10 text-health-purple text-sm">Progress Insights</span>
            </div>
          </div>
        );

      case 'basics':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Age Range</label>
              <div className="grid grid-cols-3 gap-2">
                {ageRanges.map(range => (
                  <button
                    key={range}
                    onClick={() => setFormData(prev => ({ ...prev, age_range: range }))}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.age_range === range
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Gender (Optional)</label>
              <div className="grid grid-cols-3 gap-2">
                {['Male', 'Female', 'Other'].map(gender => (
                  <button
                    key={gender}
                    onClick={() => setFormData(prev => ({ ...prev, gender: gender.toLowerCase() }))}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.gender === gender.toLowerCase()
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Height (cm) - Optional</label>
                <input
                  type="number"
                  placeholder="170"
                  value={formData.height_cm || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    height_cm: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                  className="w-full p-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Weight (kg) - Optional</label>
                <input
                  type="number"
                  placeholder="70"
                  value={formData.weight_kg || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    weight_kg: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                  className="w-full p-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none"
                />
              </div>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">What's your main wellness goal?</p>
            <div className="grid grid-cols-2 gap-3">
              {fitnessGoals.map(goal => (
                <button
                  key={goal.value}
                  onClick={() => setFormData(prev => ({ ...prev, fitness_goal: goal.value }))}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    formData.fitness_goal === goal.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{goal.emoji}</span>
                  <span className="font-medium">{goal.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'lifestyle':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Current Activity Level</label>
              <div className="space-y-2">
                {activityLevels.map(level => (
                  <button
                    key={level.value}
                    onClick={() => setFormData(prev => ({ ...prev, activity_level: level.value }))}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      formData.activity_level === level.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="font-medium block">{level.label}</span>
                    <span className="text-sm text-muted-foreground">{level.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Your Lifestyle</label>
              <div className="grid grid-cols-3 gap-2">
                {lifestylePreferences.map(pref => (
                  <button
                    key={pref.value}
                    onClick={() => setFormData(prev => ({ ...prev, lifestyle_preference: pref.value }))}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      formData.lifestyle_preference === pref.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="font-medium block">{pref.label}</span>
                    <span className="text-xs text-muted-foreground">{pref.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'interests':
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">Select your wellness interests (choose at least 2)</p>
            <div className="grid grid-cols-2 gap-3">
              {interestOptions.map(interest => (
                <button
                  key={interest.value}
                  onClick={() => toggleInterest(interest.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                    formData.interests.includes(interest.value)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-2xl">{interest.emoji}</span>
                  <span className="font-medium">{interest.label}</span>
                  {formData.interests.includes(interest.value) && (
                    <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl border-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={step.id}
                    className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                  >
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                        index <= currentStep
                          ? 'gradient-bg text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <StepIcon className="h-5 w-5" />
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-1 flex-1 mx-2 rounded ${
                          index < currentStep ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <CardTitle className="text-xl font-display">{steps[currentStep].title}</CardTitle>
            <CardDescription>Step {currentStep + 1} of {steps.length}</CardDescription>
            <Progress value={progress} className="h-1 mt-2" />
          </CardHeader>

          <CardContent className="min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          <div className="p-6 pt-0 flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleComplete}
                disabled={saving || formData.interests.length < 2}
                className="gradient-bg"
              >
                {saving ? 'Saving...' : 'Complete Setup'}
                <Sparkles className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
