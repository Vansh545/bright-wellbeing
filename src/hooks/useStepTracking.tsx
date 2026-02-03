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
  
  // Device motion tracking refs
  const stepCountRef = useRef(0);
  const lastAccelRef = useRef({ x: 0, y: 0, z: 0 });
  const stepThreshold = 1.2; // Acceleration threshold for step detection

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

  // Device Motion step detection (fallback)
  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    const accel = event.accelerationIncludingGravity;
    if (!accel || !accel.x || !accel.y || !accel.z) return;

    const { x, y, z } = accel;
    const lastAccel = lastAccelRef.current;
    
    // Calculate acceleration magnitude change
    const deltaX = Math.abs(x - lastAccel.x);
    const deltaY = Math.abs(y - lastAccel.y);
    const deltaZ = Math.abs(z - lastAccel.z);
    const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);

    // Step detection threshold
    if (magnitude > stepThreshold) {
      stepCountRef.current += 1;
      setStepData(prev => {
        const newSteps = prev.steps + 1;
        return {
          ...prev,
          steps: newSteps,
          percentage: Math.min(100, (newSteps / prev.goalSteps) * 100),
        };
      });
    }

    lastAccelRef.current = { x, y, z };
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

    window.addEventListener('devicemotion', handleMotion);
    setIsTracking(true);
    setStepData(prev => ({ ...prev, source: 'device_motion' }));
    toast.success('Step tracking started!');
    return true;
  }, [handleMotion]);

  // Stop device motion tracking
  const stopDeviceMotionTracking = useCallback(() => {
    window.removeEventListener('devicemotion', handleMotion);
    setIsTracking(false);
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

      // Log to step_logs
      await supabase
        .from('step_logs')
        .insert({
          user_id: user.id,
          steps: stepData.steps,
          source: stepData.source,
        });

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
    }
  }, [user, stepData.steps, dailyGoal]);

  // Connect to Google Fit (placeholder - requires OAuth setup)
  const connectGoogleFit = useCallback(async () => {
    if (!user) return;

    // For now, create a placeholder connection
    // Full OAuth implementation would require Google Cloud setup
    const { error } = await supabase
      .from('fitness_connections')
      .upsert({
        user_id: user.id,
        provider: 'google_fit',
        is_connected: false, // Will be true after OAuth flow
      }, { onConflict: 'user_id' });

    if (error) {
      toast.error('Failed to setup Google Fit connection');
      return;
    }

    toast.info('Google Fit integration coming soon! Using device motion for now.');
    
    // Fall back to device motion
    await startDeviceMotionTracking();
  }, [user, startDeviceMotionTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [handleMotion]);

  // Auto-save steps periodically
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
    refetch: fetchDailyData,
  };
}
