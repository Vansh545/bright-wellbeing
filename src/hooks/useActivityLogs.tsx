import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  activity_name: string;
  duration_minutes: number | null;
  calories_burned: number | null;
  intensity: string | null;
  notes: string | null;
  logged_at: string;
  created_at: string;
}

export interface WeeklyCheckin {
  id: string;
  user_id: string;
  week_start: string;
  energy_level: number | null;
  mood_rating: number | null;
  stress_level: number | null;
  sleep_quality: number | null;
  notes: string | null;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_name: string;
  description: string | null;
  earned_at: string;
}

export function useActivityLogs() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!user) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', thirtyDaysAgo.toISOString())
        .order('logged_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchAchievements = useCallback(async () => {
    if (!user) {
      setAchievements([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchActivities();
    fetchAchievements();
  }, [fetchActivities, fetchAchievements]);

  const logActivity = async (activity: Omit<ActivityLog, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        ...activity,
      })
      .select()
      .single();

    if (error) throw error;
    setActivities(prev => [data, ...prev]);
    
    // Update streak
    await updateStreak();
    
    return data;
  };

  const updateStreak = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Get current streak data
    const { data: currentStreak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!currentStreak) {
      // Initialize streak
      await supabase
        .from('user_streaks')
        .insert({
          user_id: user.id,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
          weekly_activity_count: 1,
          monthly_activity_count: 1,
        });
      return;
    }

    const lastActivity = currentStreak.last_activity_date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = currentStreak.current_streak;
    
    if (lastActivity === today) {
      // Already logged today, just update counts
      newStreak = currentStreak.current_streak;
    } else if (lastActivity === yesterdayStr) {
      // Consecutive day
      newStreak = currentStreak.current_streak + 1;
    } else {
      // Streak broken
      newStreak = 1;
    }

    const newLongest = Math.max(currentStreak.longest_streak, newStreak);

    await supabase
      .from('user_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity_date: today,
        weekly_activity_count: currentStreak.weekly_activity_count + 1,
        monthly_activity_count: currentStreak.monthly_activity_count + 1,
      })
      .eq('user_id', user.id);
  };

  const earnAchievement = async (achievement: Omit<Achievement, 'id' | 'user_id' | 'earned_at'>) => {
    if (!user) throw new Error('User not authenticated');

    // Check if already earned
    const existing = achievements.find(a => a.achievement_type === achievement.achievement_type);
    if (existing) return existing;

    const { data, error } = await supabase
      .from('achievements')
      .insert({
        user_id: user.id,
        ...achievement,
      })
      .select()
      .single();

    if (error) {
      // Might be a duplicate, that's okay
      if (error.code !== '23505') throw error;
      return null;
    }
    
    setAchievements(prev => [data, ...prev]);
    return data;
  };

  // Calculate weekly stats
  const getWeeklyStats = useCallback(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weekActivities = activities.filter(a => 
      new Date(a.logged_at) >= startOfWeek
    );

    const totalWorkouts = weekActivities.filter(a => a.activity_type === 'workout').length;
    const totalCalories = weekActivities.reduce((sum, a) => sum + (a.calories_burned || 0), 0);
    const totalMinutes = weekActivities.reduce((sum, a) => sum + (a.duration_minutes || 0), 0);
    const activeDays = new Set(weekActivities.map(a => 
      new Date(a.logged_at).toISOString().split('T')[0]
    )).size;

    return {
      totalWorkouts,
      totalCalories,
      totalMinutes,
      activeDays,
      weekActivities,
    };
  }, [activities]);

  // Get activity by day for charts
  const getActivityByDay = useCallback(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const result = days.map((day, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - now.getDay() + index);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayActivities = activities.filter(a => 
        a.logged_at.split('T')[0] === dateStr
      );

      return {
        day,
        workouts: dayActivities.filter(a => a.activity_type === 'workout').length,
        calories: dayActivities.reduce((sum, a) => sum + (a.calories_burned || 0), 0),
      };
    });

    return result;
  }, [activities]);

  return {
    activities,
    achievements,
    loading,
    logActivity,
    earnAchievement,
    getWeeklyStats,
    getActivityByDay,
    refetch: fetchActivities,
  };
}

// Smart recommendations based on user data
export function getSmartRecommendations(
  profile: { fitness_goal: string; activity_level: string } | null,
  weeklyStats: { totalWorkouts: number; activeDays: number },
  streak: { current_streak: number } | null
) {
  const recommendations: Array<{
    type: 'workout' | 'rest' | 'motivation' | 'tip';
    title: string;
    message: string;
    priority: number;
  }> = [];

  if (!profile) return recommendations;

  // Check consistency
  if (weeklyStats.activeDays < 3) {
    recommendations.push({
      type: 'motivation',
      title: 'Stay Consistent! 💪',
      message: 'You were most active on Wednesdays last week. Try to build on that momentum!',
      priority: 1,
    });
  }

  // Check for rest needs
  if (weeklyStats.totalWorkouts >= 5) {
    recommendations.push({
      type: 'rest',
      title: 'Great Progress! Time to Rest 🧘',
      message: 'You\'ve been very active this week. Consider a light stretching day.',
      priority: 2,
    });
  }

  // Streak-based encouragement
  if (streak && streak.current_streak >= 7) {
    recommendations.push({
      type: 'motivation',
      title: 'Amazing Streak! 🔥',
      message: `${streak.current_streak} days strong! You're building incredible habits.`,
      priority: 1,
    });
  } else if (streak && streak.current_streak === 0) {
    recommendations.push({
      type: 'workout',
      title: 'Start Fresh Today! 🌟',
      message: 'Just 10 minutes is enough to get back on track.',
      priority: 1,
    });
  }

  // Goal-based recommendations
  if (profile.fitness_goal === 'fat_loss' && weeklyStats.totalWorkouts < 4) {
    recommendations.push({
      type: 'workout',
      title: 'Quick Cardio Suggestion',
      message: 'A 20-minute HIIT session could boost your fat loss goals.',
      priority: 2,
    });
  }

  if (profile.fitness_goal === 'muscle_gain') {
    recommendations.push({
      type: 'tip',
      title: 'Nutrition Reminder 🥗',
      message: 'Don\'t forget your protein intake today for muscle recovery!',
      priority: 3,
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority);
}
