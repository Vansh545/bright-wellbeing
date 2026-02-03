-- Add tables for step tracking and fitness integrations
CREATE TABLE public.step_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  steps INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'manual', -- 'google_fit', 'device_motion', 'manual'
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.step_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for step_logs
CREATE POLICY "Users can view their own step logs" 
ON public.step_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own step logs" 
ON public.step_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own step logs" 
ON public.step_logs FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own step logs" 
ON public.step_logs FOR DELETE 
USING (auth.uid() = user_id);

-- Add Google Fit tokens table for OAuth
CREATE TABLE public.fitness_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  provider TEXT NOT NULL DEFAULT 'google_fit',
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  is_connected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fitness_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies for fitness_connections
CREATE POLICY "Users can view their own connections" 
ON public.fitness_connections FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connections" 
ON public.fitness_connections FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections" 
ON public.fitness_connections FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections" 
ON public.fitness_connections FOR DELETE 
USING (auth.uid() = user_id);

-- Add notification_preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  morning_enabled BOOLEAN NOT NULL DEFAULT true,
  activity_reminders BOOLEAN NOT NULL DEFAULT true,
  wellness_tips BOOLEAN NOT NULL DEFAULT true,
  progress_updates BOOLEAN NOT NULL DEFAULT true,
  evening_reflection BOOLEAN NOT NULL DEFAULT true,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  timezone TEXT DEFAULT 'UTC',
  last_notification_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_preferences
CREATE POLICY "Users can view their own preferences" 
ON public.notification_preferences FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
ON public.notification_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.notification_preferences FOR UPDATE 
USING (auth.uid() = user_id);

-- Add daily_goals table for tracking
CREATE TABLE public.daily_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  step_goal INTEGER NOT NULL DEFAULT 10000,
  steps_completed INTEGER NOT NULL DEFAULT 0,
  activity_goal_minutes INTEGER NOT NULL DEFAULT 30,
  activity_completed_minutes INTEGER NOT NULL DEFAULT 0,
  water_goal_glasses INTEGER DEFAULT 8,
  water_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_goals
CREATE POLICY "Users can view their own goals" 
ON public.daily_goals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" 
ON public.daily_goals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.daily_goals FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_fitness_connections_updated_at
BEFORE UPDATE ON public.fitness_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_goals_updated_at
BEFORE UPDATE ON public.daily_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Allow inserting notifications (was missing)
CREATE POLICY "Users can create notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (auth.uid() = user_id);