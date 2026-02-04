import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface StepData {
  steps: number;
  source: 'google_fit' | 'device_motion' | 'manual';
  goalSteps: number;
  percentage: number;
}

export interface DailyGoal {
  id: string;
  user_id: string;
  date: string;
  step_goal: number;
  steps_completed: number;
  activity_goal_minutes: number;
  activity_completed_minutes: number;
}

export interface FitnessConnection {
  id: string;
  user_id: string;
  provider: string;
  is_connected: boolean;
  last_sync_at: string | null;
}

// Step detection algorithm with noise filtering
class StepDetector {
  private readonly threshold = 1.8; // Higher threshold to avoid false positives
  private readonly minStepInterval = 250; // Minimum ms between steps (prevents double counting)
  private lastStepTime = 0;
  private lastMagnitude = 0;
  private peakDetected = false;
  private samples: number[] = [];
  private readonly sampleSize = 5; // Moving average window

  detectStep(x: number, y: number, z: number): boolean {
    // Calculate magnitude
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    
    // Add to moving average
    this.samples.push(magnitude);
    if (this.samples.length > this.sampleSize) {
      this.samples.shift();
    }

    // Calculate moving average
    const avgMagnitude = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    
    // Calculate deviation from average (helps filter noise)
    const deviation = Math.abs(magnitude - avgMagnitude);
    
    const now = Date.now();
    const timeSinceLastStep = now - this.lastStepTime;

    // Peak detection with debouncing
    if (deviation > this.threshold && !this.peakDetected && timeSinceLastStep > this.minStepInterval) {
      this.peakDetected = true;
      this.lastStepTime = now;
      this.lastMagnitude = magnitude;
      return true;
    }

    // Reset peak detection when magnitude drops
    if (deviation < this.threshold / 2) {
      this.peakDetected = false;
    }

    this.lastMagnitude = magnitude;
    return false;
  }

  reset() {
    this.samples = [];
    this.lastStepTime = 0;
    this.lastMagnitude = 0;
    this.peakDetected = false;
  }
}

export function useStepTracking() {
  const { user } = useAuth();
  const [stepData, setStepData] = useState<StepData>({
    steps: 0,
    source: 'manual',
    goalSteps: 10000,
    percentage: 0,
  });
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);
  const [fitnessConnection, setFitnessConnection] = useState<FitnessConnection | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Step detector instance
  const stepDetectorRef = useRef(new StepDetector());
  const baseStepsRef = useRef(0); // Steps at start of tracking session

  // Fetch today's goal and connection status
  const fetchDailyData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch or create daily goal
      const { data: existingGoal } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (existingGoal) {
        setDailyGoal(existingGoal as DailyGoal);
        baseStepsRef.current = existingGoal.steps_completed;
        setStepData(prev => ({
          ...prev,
          steps: existingGoal.steps_completed,
          goalSteps: existingGoal.step_goal,
          percentage: Math.min(100, (existingGoal.steps_completed / existingGoal.step_goal) * 100),
        }));
      } else {
        // Create today's goal
        const { data: newGoal } = await supabase
          .from('daily_goals')
          .insert({
            user_id: user.id,
            date: today,
            step_goal: 10000,
            steps_completed: 0,
          })
          .select()
          .single();

        if (newGoal) {
          setDailyGoal(newGoal as DailyGoal);
          baseStepsRef.current = 0;
        }
      }

      // Check fitness connection
      const { data: connection } = await supabase
        .from('fitness_connections')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (connection) {
        setFitnessConnection(connection as FitnessConnection);
        if (connection.is_connected) {
          setStepData(prev => ({ ...prev, source: 'google_fit' }));
        }
      }

    } catch (err) {
      console.error('Error fetching step data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDailyData();
  }, [fetchDailyData]);

  // Device Motion step detection with improved algorithm
  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    const accel = event.accelerationIncludingGravity;
    if (!accel || accel.x === null || accel.y === null || accel.z === null) return;

    const { x, y, z } = accel;
    
    // Use step detector for noise-filtered detection
    if (stepDetectorRef.current.detectStep(x, y, z)) {
      setStepData(prev => {
        const newSteps = prev.steps + 1;
        return {
          ...prev,
          steps: newSteps,
          percentage: Math.min(100, (newSteps / prev.goalSteps) * 100),
        };
      });
    }
  }, []);

  // Start device motion tracking
  const startDeviceMotionTracking = useCallback(async () => {
    if (!('DeviceMotionEvent' in window)) {
      toast.error('Step tracking not supported on this device');
      return false;
    }

    // Request permission on iOS
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission !== 'granted') {
          toast.error('Motion permission denied');
          return false;
        }
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }

    // Reset detector for new session
    stepDetectorRef.current.reset();
    baseStepsRef.current = stepData.steps;

    window.addEventListener('devicemotion', handleMotion);
    setIsTracking(true);
    setStepData(prev => ({ ...prev, source: 'device_motion' }));
    toast.success('Step tracking started! Walk around to count steps.');
    return true;
  }, [handleMotion, stepData.steps]);

  // Stop device motion tracking
  const stopDeviceMotionTracking = useCallback(() => {
    window.removeEventListener('devicemotion', handleMotion);
    setIsTracking(false);
    stepDetectorRef.current.reset();
  }, [handleMotion]);

  // Save step count to database
  const saveSteps = useCallback(async () => {
    if (!user || !dailyGoal) return;

    try {
      // Update daily goal
      await supabase
        .from('daily_goals')
        .update({ steps_completed: stepData.steps })
        .eq('id', dailyGoal.id);

      // Log to step_logs if there's a change
      if (stepData.steps > baseStepsRef.current) {
        await supabase
          .from('step_logs')
          .insert({
            user_id: user.id,
            steps: stepData.steps - baseStepsRef.current,
            source: stepData.source,
          });
        baseStepsRef.current = stepData.steps;
      }

      toast.success('Steps saved!');
    } catch (err) {
      console.error('Error saving steps:', err);
      toast.error('Failed to save steps');
    }
  }, [user, dailyGoal, stepData]);

  // Update step goal
  const updateStepGoal = useCallback(async (newGoal: number) => {
    if (!user || !dailyGoal) return;

    try {
      await supabase
        .from('daily_goals')
        .update({ step_goal: newGoal })
        .eq('id', dailyGoal.id);

      setDailyGoal(prev => prev ? { ...prev, step_goal: newGoal } : null);
      setStepData(prev => ({
        ...prev,
        goalSteps: newGoal,
        percentage: Math.min(100, (prev.steps / newGoal) * 100),
      }));
    } catch (err) {
      console.error('Error updating goal:', err);
    }
  }, [user, dailyGoal]);

  // Add manual steps
  const addManualSteps = useCallback(async (steps: number) => {
    if (!user) return;

    const newTotal = stepData.steps + steps;
    setStepData(prev => ({
      ...prev,
      steps: newTotal,
      source: 'manual',
      percentage: Math.min(100, (newTotal / prev.goalSteps) * 100),
    }));

    // Update in database
    if (dailyGoal) {
      await supabase
        .from('daily_goals')
        .update({ steps_completed: newTotal })
        .eq('id', dailyGoal.id);

      // Log manual entry
      await supabase
        .from('step_logs')
        .insert({
          user_id: user.id,
          steps: steps,
          source: 'manual',
        });
    }

    toast.success(`Added ${steps.toLocaleString()} steps`);
  }, [user, stepData.steps, dailyGoal]);

  // Connect to Google Fit (requires OAuth setup)
  const connectGoogleFit = useCallback(async () => {
    if (!user) return;

    // Note: Full Google Fit OAuth requires:
    // 1. Google Cloud project with Fitness API enabled
    // 2. OAuth consent screen configured
    // 3. OAuth client credentials
    // For now, we create a placeholder and use device motion

    const { error } = await supabase
      .from('fitness_connections')
      .upsert({
        user_id: user.id,
        provider: 'google_fit',
        is_connected: false,
      }, { onConflict: 'user_id' });

    if (error) {
      toast.error('Failed to setup Google Fit connection');
      return;
    }

    setFitnessConnection({
      id: '',
      user_id: user.id,
      provider: 'google_fit',
      is_connected: false,
      last_sync_at: null,
    });

    toast.info(
      'Google Fit requires OAuth setup. For now, use the step tracker with your device\'s motion sensor.',
      { duration: 5000 }
    );
    
    // Offer to start device motion tracking
    await startDeviceMotionTracking();
  }, [user, startDeviceMotionTracking]);

  // Disconnect Google Fit
  const disconnectGoogleFit = useCallback(async () => {
    if (!user) return;

    await supabase
      .from('fitness_connections')
      .delete()
      .eq('user_id', user.id);

    setFitnessConnection(null);
    setStepData(prev => ({ ...prev, source: 'manual' }));
    toast.success('Disconnected from Google Fit');
  }, [user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [handleMotion]);

  // Auto-save steps periodically when tracking
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      saveSteps();
    }, 60000); // Save every minute

    return () => clearInterval(interval);
  }, [isTracking, saveSteps]);

  return {
    stepData,
    dailyGoal,
    fitnessConnection,
    isTracking,
    loading,
    startDeviceMotionTracking,
    stopDeviceMotionTracking,
    saveSteps,
    updateStepGoal,
    addManualSteps,
    connectGoogleFit,
    disconnectGoogleFit,
    refetch: fetchDailyData,
  };
}
