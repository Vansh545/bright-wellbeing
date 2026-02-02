import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Dumbbell, 
  Heart, 
  Zap, 
  Timer,
  Flame,
  X,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

const activityTypes = [
  { value: 'workout', label: 'Workout', icon: Dumbbell, color: 'bg-health-coral' },
  { value: 'cardio', label: 'Cardio', icon: Heart, color: 'bg-health-teal' },
  { value: 'strength', label: 'Strength', icon: Zap, color: 'bg-health-purple' },
  { value: 'flexibility', label: 'Flexibility', icon: Timer, color: 'bg-health-blue' },
];

const intensityLevels = [
  { value: 'light', label: 'Light', description: 'Easy, can hold a conversation' },
  { value: 'moderate', label: 'Moderate', description: 'Slightly challenging' },
  { value: 'intense', label: 'Intense', description: 'Hard, breathing heavy' },
  { value: 'max', label: 'Maximum', description: 'All-out effort' },
];

const quickWorkouts = [
  { name: 'Morning Run', type: 'cardio', duration: 30, calories: 300 },
  { name: 'HIIT Session', type: 'workout', duration: 20, calories: 250 },
  { name: 'Strength Training', type: 'strength', duration: 45, calories: 200 },
  { name: 'Yoga Flow', type: 'flexibility', duration: 30, calories: 100 },
  { name: 'Walking', type: 'cardio', duration: 30, calories: 120 },
  { name: 'Cycling', type: 'cardio', duration: 45, calories: 400 },
];

export function ActivityLogger() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    activity_type: 'workout',
    activity_name: '',
    duration_minutes: 30,
    calories_burned: 200,
    intensity: 'moderate',
    notes: '',
  });

  const { logActivity } = useActivityLogs();
  const { createNotification } = useNotifications();
  const { toast } = useToast();

  const handleQuickLog = async (workout: typeof quickWorkouts[0]) => {
    try {
      setSaving(true);
      await logActivity({
        activity_type: workout.type,
        activity_name: workout.name,
        duration_minutes: workout.duration,
        calories_burned: workout.calories,
        intensity: 'moderate',
        notes: null,
        logged_at: new Date().toISOString(),
      });

      // Create notification
      await createNotification({
        title: 'Activity Logged! 💪',
        message: `Great job completing ${workout.name}! You burned ${workout.calories} calories.`,
        type: 'success',
        category: 'workout',
        action_url: '/fitness',
      });

      toast({
        title: 'Activity Logged!',
        description: `${workout.name} has been recorded.`,
      });
    } catch (error) {
      toast({
        title: 'Failed to log activity',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.activity_name.trim()) {
      toast({
        title: 'Activity name required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      await logActivity({
        ...formData,
        notes: formData.notes || null,
        logged_at: new Date().toISOString(),
      });

      await createNotification({
        title: 'Activity Logged! 💪',
        message: `Great job completing ${formData.activity_name}! You burned ${formData.calories_burned} calories.`,
        type: 'success',
        category: 'workout',
        action_url: '/fitness',
      });

      toast({
        title: 'Activity Logged!',
        description: `${formData.activity_name} has been recorded.`,
      });

      setOpen(false);
      setFormData({
        activity_type: 'workout',
        activity_name: '',
        duration_minutes: 30,
        calories_burned: 200,
        intensity: 'moderate',
        notes: '',
      });
    } catch (error) {
      toast({
        title: 'Failed to log activity',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl gradient-bg flex items-center justify-center">
              <Plus className="h-4 w-4 text-primary-foreground" />
            </div>
            Log Activity
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-bg">
                <Plus className="h-4 w-4 mr-1" />
                Custom
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Custom Activity</DialogTitle>
                <DialogDescription>
                  Record your workout or activity to track your progress.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Activity Type</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {activityTypes.map(type => {
                      const TypeIcon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setFormData(prev => ({ ...prev, activity_type: type.value }))}
                          className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                            formData.activity_type === type.value
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className={`h-8 w-8 rounded-lg ${type.color} flex items-center justify-center`}>
                            <TypeIcon className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <span className="text-xs">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity_name">Activity Name</Label>
                  <Input
                    id="activity_name"
                    placeholder="e.g., Morning Run"
                    value={formData.activity_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, activity_name: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories Burned</Label>
                    <Input
                      id="calories"
                      type="number"
                      value={formData.calories_burned}
                      onChange={(e) => setFormData(prev => ({ ...prev, calories_burned: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Intensity</Label>
                  <Select 
                    value={formData.intensity} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, intensity: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {intensityLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          <div>
                            <span className="font-medium">{level.label}</span>
                            <span className="text-muted-foreground ml-2 text-xs">{level.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    placeholder="How did it feel?"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={saving} className="gradient-bg">
                  {saving ? 'Saving...' : 'Log Activity'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">Quick log popular activities:</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {quickWorkouts.map((workout, index) => {
            const typeInfo = activityTypes.find(t => t.value === workout.type) || activityTypes[0];
            const TypeIcon = typeInfo.icon;
            return (
              <motion.button
                key={workout.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleQuickLog(workout)}
                disabled={saving}
                className="p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all text-left group disabled:opacity-50"
              >
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-xl ${typeInfo.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <TypeIcon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{workout.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {workout.duration}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        {workout.calories}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
