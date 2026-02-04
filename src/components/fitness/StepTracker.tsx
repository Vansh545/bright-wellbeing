import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Footprints, 
  Target, 
  Play, 
  Pause, 
  Plus,
  Settings,
  Smartphone,
  Activity as ActivityIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useStepTracking } from '@/hooks/useStepTracking';

export function StepTracker() {
  const {
    stepData,
    dailyGoal,
    isTracking,
    loading,
    startDeviceMotionTracking,
    stopDeviceMotionTracking,
    updateStepGoal,
    addManualSteps,
    connectGoogleFit,
  } = useStepTracking();

  const [manualSteps, setManualSteps] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);

  const handleAddManualSteps = () => {
    const steps = parseInt(manualSteps);
    if (steps > 0) {
      addManualSteps(steps);
      setManualSteps('');
      setIsAddDialogOpen(false);
    }
  };

  const handleUpdateGoal = () => {
    const goal = parseInt(newGoal);
    if (goal > 0) {
      updateStepGoal(goal);
      setNewGoal('');
      setIsGoalDialogOpen(false);
    }
  };

  const handleToggleTracking = async () => {
    if (isTracking) {
      stopDeviceMotionTracking();
    } else {
      await startDeviceMotionTracking();
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-32 bg-muted rounded-full w-32 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressColor = stepData.percentage >= 100 
    ? 'bg-health-green' 
    : stepData.percentage >= 50 
      ? 'bg-health-blue' 
      : 'bg-health-coral';

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Footprints className="h-5 w-5 text-health-blue" />
            Step Tracker
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Step Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Daily Step Goal</Label>
                    <Input
                      type="number"
                      placeholder={stepData.goalSteps.toString()}
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleUpdateGoal} className="w-full">
                    Update Goal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Circular Progress */}
        <div className="relative flex items-center justify-center py-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative h-40 w-40"
          >
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-muted"
              />
              {/* Progress circle */}
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeLinecap="round"
                className={stepData.percentage >= 100 ? 'text-health-green' : 'text-health-blue'}
                strokeDasharray={440}
                initial={{ strokeDashoffset: 440 }}
                animate={{ strokeDashoffset: 440 - (440 * Math.min(stepData.percentage, 100)) / 100 }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                key={stepData.steps}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold"
              >
                {stepData.steps.toLocaleString()}
              </motion.span>
              <span className="text-sm text-muted-foreground">
                / {stepData.goalSteps.toLocaleString()}
              </span>
              {stepData.percentage >= 100 && (
                <span className="text-xs text-health-green font-medium mt-1">
                  🎉 Goal reached!
                </span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Source indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          {stepData.source === 'device_motion' && (
            <>
              <Smartphone className="h-4 w-4" />
              <span>Tracking via device motion</span>
            </>
          )}
          {stepData.source === 'google_fit' && (
            <>
              <ActivityIcon className="h-4 w-4" />
              <span>Synced with Google Fit</span>
            </>
          )}
          {stepData.source === 'manual' && (
            <>
              <Plus className="h-4 w-4" />
              <span>Manual entry</span>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={isTracking ? 'destructive' : 'default'}
            onClick={handleToggleTracking}
            className="gap-2"
          >
            {isTracking ? (
              <>
                <Pause className="h-4 w-4" />
                Stop Tracking
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start Tracking
              </>
            )}
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Steps
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Steps Manually</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Number of Steps</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 2000"
                    value={manualSteps}
                    onChange={(e) => setManualSteps(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddManualSteps} className="w-full">
                  Add Steps
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Google Fit connection info */}
        <div className="p-4 bg-muted/50 rounded-xl text-center space-y-2">
          <p className="text-sm font-medium">Real Step Tracking</p>
          <p className="text-xs text-muted-foreground">
            Start tracking to use your device's motion sensor. For best results, keep your phone in your pocket while walking.
          </p>
          <p className="text-xs text-muted-foreground">
            Google Fit integration requires additional OAuth setup. Use device motion or add steps manually.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
