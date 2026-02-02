-- Create user profiles table for onboarding data
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  age_range TEXT,
  gender TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  fitness_goal TEXT NOT NULL DEFAULT 'general_health',
  activity_level TEXT NOT NULL DEFAULT 'moderate',
  lifestyle_preference TEXT NOT NULL DEFAULT 'moderate',
  interests TEXT[] DEFAULT ARRAY['fitness', 'nutrition']::TEXT[],
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity logs table for tracking workouts and habits
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity_name TEXT NOT NULL,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  intensity TEXT DEFAULT 'moderate',
  notes TEXT,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create streaks table for tracking user consistency
CREATE TABLE public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  weekly_activity_count INTEGER NOT NULL DEFAULT 0,
  monthly_activity_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  category TEXT NOT NULL DEFAULT 'general',
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weekly check-ins table
CREATE TABLE public.weekly_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Create push subscriptions table for browser notifications
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Create achievements table for badges
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_type)
);

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for activity_logs
CREATE POLICY "Users can view their own activities" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own activities" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own activities" ON public.activity_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own activities" ON public.activity_logs FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for user_streaks
CREATE POLICY "Users can view their own streaks" ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own streaks" ON public.user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own streaks" ON public.user_streaks FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for weekly_checkins
CREATE POLICY "Users can view their own checkins" ON public.weekly_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own checkins" ON public.weekly_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own checkins" ON public.weekly_checkins FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for push_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.push_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own subscriptions" ON public.push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own subscriptions" ON public.push_subscriptions FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for achievements
CREATE POLICY "Users can view their own achievements" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_activity_logs_user_logged ON public.activity_logs(user_id, logged_at DESC);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_achievements_user ON public.achievements(user_id);

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON public.user_streaks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();