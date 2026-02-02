import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserProfile {
  id: string;
  user_id: string;
  age_range: string | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  fitness_goal: string;
  activity_level: string;
  lifestyle_preference: string;
  interests: string[];
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  weekly_activity_count: number;
  monthly_activity_count: number;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setStreak(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch streak
      const { data: streakData, error: streakError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (streakError) throw streakError;
      setStreak(streakData);

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        ...profileData,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  };

  const initializeStreak = async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_streaks')
      .upsert({
        user_id: user.id,
        current_streak: 0,
        longest_streak: 0,
        weekly_activity_count: 0,
        monthly_activity_count: 0,
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    setStreak(data);
    return data;
  };

  const needsOnboarding = !loading && user && (!profile || !profile.onboarding_completed);

  return {
    profile,
    streak,
    loading,
    error,
    saveProfile,
    initializeStreak,
    needsOnboarding,
    refetch: fetchProfile,
  };
}
