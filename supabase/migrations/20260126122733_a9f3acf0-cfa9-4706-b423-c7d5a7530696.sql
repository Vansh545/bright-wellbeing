-- Create table for storing app-wide settings (API keys, etc.)
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read settings (for API connection status)
CREATE POLICY "Authenticated users can view settings status"
ON public.app_settings
FOR SELECT
TO authenticated
USING (true);

-- Create table for user video watch history
CREATE TABLE public.user_video_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id TEXT NOT NULL,
  video_title TEXT,
  video_thumbnail TEXT,
  video_channel TEXT,
  video_duration TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  watch_duration_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  UNIQUE(user_id, video_id)
);

-- Enable RLS on user_video_history
ALTER TABLE public.user_video_history ENABLE ROW LEVEL SECURITY;

-- Users can only access their own video history
CREATE POLICY "Users can view their own video history"
ON public.user_video_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video history"
ON public.user_video_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video history"
ON public.user_video_history
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create table for saved/bookmarked videos
CREATE TABLE public.saved_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id TEXT NOT NULL,
  video_title TEXT NOT NULL,
  video_thumbnail TEXT,
  video_channel TEXT,
  video_duration TEXT,
  video_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Enable RLS on saved_videos
ALTER TABLE public.saved_videos ENABLE ROW LEVEL SECURITY;

-- Users can only access their own saved videos
CREATE POLICY "Users can view their own saved videos"
ON public.saved_videos
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can save videos"
ON public.saved_videos
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove saved videos"
ON public.saved_videos
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create table for user video preferences
CREATE TABLE public.user_video_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  preferred_categories TEXT[] DEFAULT ARRAY['fitness', 'wellness', 'nutrition'],
  preferred_difficulty TEXT DEFAULT 'beginner',
  preferred_duration TEXT DEFAULT 'medium',
  interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  avoided_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_video_preferences
ALTER TABLE public.user_video_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only access their own preferences
CREATE POLICY "Users can view their own preferences"
ON public.user_video_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.user_video_preferences
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.user_video_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for timestamp updates
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_video_preferences_updated_at
BEFORE UPDATE ON public.user_video_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();