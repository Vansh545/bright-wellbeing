import { useState } from 'react';
import { motion } from 'framer-motion';
import { Smile, Frown, Meh, Zap, Moon, Brain, X, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface WeeklyCheckInProps {
  onClose: () => void;
  onComplete: () => void;
}

const ratingOptions = [
  { value: 1, icon: Frown, label: 'Poor', color: 'text-health-coral' },
  { value: 2, icon: Frown, label: 'Low', color: 'text-health-yellow' },
  { value: 3, icon: Meh, label: 'Okay', color: 'text-health-blue' },
  { value: 4, icon: Smile, label: 'Good', color: 'text-health-teal' },
  { value: 5, icon: Smile, label: 'Great', color: 'text-health-green' },
];

export function WeeklyCheckIn({ onClose, onComplete }: WeeklyCheckInProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    energy_level: 3,
    mood_rating: 3,
    stress_level: 3,
    sleep_quality: 3,
    notes: '',
  });

  const questions = [
    { key: 'energy_level', label: 'How are your energy levels this week?', icon: Zap },
    { key: 'mood_rating', label: 'How has your overall mood been?', icon: Smile },
    { key: 'stress_level', label: 'How stressed have you felt?', icon: Brain, inverted: true },
    { key: 'sleep_quality', label: 'How well have you been sleeping?', icon: Moon },
  ];

  const handleRating = (key: string, value: number) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (step < questions.length - 1) {
      setTimeout(() => setStep(prev => prev + 1), 300);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setSaving(true);
      
      // Get current week's Monday
      const now = new Date();
      const monday = new Date(now);
      monday.setDate(now.getDate() - now.getDay() + 1);
      monday.setHours(0, 0, 0, 0);

      await supabase
        .from('weekly_checkins')
        .upsert({
          user_id: user.id,
          week_start: monday.toISOString().split('T')[0],
          ...formData,
        }, { onConflict: 'user_id,week_start' });

      toast({
        title: 'Check-in complete! ✨',
        description: 'Thanks for sharing. We\'ll use this to personalize your experience.',
      });

      onComplete();
    } catch (error) {
      toast({
        title: 'Check-in failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const currentQuestion = questions[step];
  const isLastStep = step === questions.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-display">Weekly Check-In 📊</CardTitle>
                <CardDescription>Quick wellness snapshot</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            {/* Progress dots */}
            <div className="flex gap-2 mt-4">
              {questions.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    idx <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {step < questions.length ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center">
                    <currentQuestion.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <p className="font-medium">{currentQuestion.label}</p>
                </div>

                <div className="flex justify-between gap-2 pt-4">
                  {ratingOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleRating(currentQuestion.key, option.value)}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                        formData[currentQuestion.key as keyof typeof formData] === option.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <option.icon className={`h-6 w-6 mx-auto ${option.color}`} />
                      <span className="text-xs mt-2 block text-muted-foreground">{option.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <p className="font-medium">Any notes for this week? (Optional)</p>
                <Textarea
                  placeholder="How are you feeling? Any wins or challenges?"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="min-h-[100px]"
                />
              </motion.div>
            )}

            <div className="flex justify-between pt-4">
              {step > 0 ? (
                <Button variant="outline" onClick={() => setStep(prev => prev - 1)}>
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step >= questions.length - 1 && (
                <Button
                  onClick={step === questions.length ? handleSubmit : () => setStep(prev => prev + 1)}
                  disabled={saving}
                  className="gradient-bg"
                >
                  {saving ? 'Saving...' : step === questions.length ? 'Submit' : 'Continue'}
                  <Send className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
