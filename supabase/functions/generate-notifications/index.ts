import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationTemplate {
  type: 'info' | 'success' | 'warning' | 'motivation' | 'reminder';
  category: 'general' | 'workout' | 'health' | 'streak' | 'achievement' | 'weekly';
  title: string;
  message: string;
}

// Smart notification templates by time of day and context
const notificationTemplates: Record<string, NotificationTemplate[]> = {
  morning: [
    { type: 'motivation', category: 'general', title: 'Good Morning! ☀️', message: 'Start your day with intention. A short stretch can boost your energy for hours.' },
    { type: 'motivation', category: 'workout', title: 'Rise & Shine! 💪', message: 'Morning workouts set the tone for a productive day. Ready to move?' },
    { type: 'info', category: 'health', title: 'Hydration Check 💧', message: 'Begin your day with a glass of water. Your body will thank you!' },
    { type: 'motivation', category: 'general', title: 'New Day, New Goals 🌟', message: 'What wellness goal will you focus on today?' },
  ],
  midday: [
    { type: 'reminder', category: 'workout', title: 'Movement Break! 🚶', message: 'A short walk now can boost your energy ✨' },
    { type: 'info', category: 'health', title: 'Posture Check 🧘', message: 'Take a moment to straighten up. Your spine will thank you!' },
    { type: 'reminder', category: 'general', title: 'Midday Refresh 🌿', message: 'Step outside for 5 minutes. Fresh air works wonders!' },
    { type: 'motivation', category: 'workout', title: 'Halfway There! 💫', message: 'Keep the momentum going - you\'re doing great!' },
  ],
  afternoon: [
    { type: 'reminder', category: 'workout', title: 'Activity Check-in 📊', message: 'You\'re close to today\'s activity goal — keep going!' },
    { type: 'info', category: 'health', title: 'Energy Boost 🔋', message: 'Feeling tired? A quick stretch can re-energize you.' },
    { type: 'motivation', category: 'streak', title: 'Keep Your Streak! 🔥', message: 'Log an activity today to maintain your progress streak.' },
    { type: 'reminder', category: 'general', title: 'Wellness Moment 🍃', message: 'Take 3 deep breaths. It only takes 30 seconds!' },
  ],
  evening: [
    { type: 'reminder', category: 'general', title: 'Daily Reflection 🌙', message: 'How was your day? Log it in 30 seconds.' },
    { type: 'info', category: 'health', title: 'Wind Down 😴', message: 'Start relaxing. Good sleep is key to wellness.' },
    { type: 'success', category: 'achievement', title: 'Great Progress! ⭐', message: 'You showed up for yourself today. That matters!' },
    { type: 'reminder', category: 'weekly', title: 'Weekly Check-in 📝', message: 'Share how you\'re feeling this week for personalized insights.' },
  ],
};

// Progress-based notifications
const progressNotifications: NotificationTemplate[] = [
  { type: 'success', category: 'streak', title: 'Streak Growing! 🔥', message: 'You\'re building amazing consistency. Keep it up!' },
  { type: 'motivation', category: 'workout', title: 'You Were Active Yesterday 💪', message: 'You were most active around this time yesterday. Ready for today?' },
  { type: 'warning', category: 'general', title: 'We Miss You! 💙', message: 'It\'s been a while since your last log. Even 5 minutes counts!' },
  { type: 'success', category: 'achievement', title: 'New Personal Best! 🏆', message: 'You\'ve exceeded your weekly activity. Amazing work!' },
];

function getTimeOfDay(): string {
  const hour = new Date().getUTCHours();
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'midday';
  if (hour >= 14 && hour < 18) return 'afternoon';
  return 'evening';
}

function getRandomTemplate(templates: NotificationTemplate[]): NotificationTemplate {
  return templates[Math.floor(Math.random() * templates.length)];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, context } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's notification preferences
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single();

    // Check quiet hours
    if (preferences) {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const quietStart = preferences.quiet_hours_start;
      const quietEnd = preferences.quiet_hours_end;
      
      if (quietStart && quietEnd) {
        if (quietStart > quietEnd) {
          // Quiet hours span midnight
          if (currentTime >= quietStart || currentTime <= quietEnd) {
            return new Response(
              JSON.stringify({ message: 'In quiet hours', notification: null }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          if (currentTime >= quietStart && currentTime <= quietEnd) {
            return new Response(
              JSON.stringify({ message: 'In quiet hours', notification: null }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      }
    }

    // Get user's recent activity for context-aware notifications
    const { data: recentActivity } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user_id)
      .order('logged_at', { ascending: false })
      .limit(5);

    const { data: streak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user_id)
      .single();

    const { data: todayGoals } = await supabase
      .from('daily_goals')
      .select('*')
      .eq('user_id', user_id)
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    // Determine notification type based on context
    let notification: NotificationTemplate;
    const timeOfDay = getTimeOfDay();

    // Context-aware selection
    if (context === 'progress' && streak && streak.current_streak > 3) {
      notification = progressNotifications[0]; // Streak growing
    } else if (context === 'inactive' || (!recentActivity || recentActivity.length === 0)) {
      notification = progressNotifications[2]; // We miss you
    } else if (todayGoals && todayGoals.steps_completed > todayGoals.step_goal * 0.8) {
      notification = { 
        type: 'success', 
        category: 'achievement', 
        title: 'Almost There! 🎯', 
        message: `You're at ${Math.round((todayGoals.steps_completed / todayGoals.step_goal) * 100)}% of your step goal!` 
      };
    } else {
      notification = getRandomTemplate(notificationTemplates[timeOfDay]);
    }

    // Create the notification in database
    const { data: createdNotification, error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        category: notification.category,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating notification:', insertError);
      throw insertError;
    }

    // Update last notification time
    await supabase
      .from('notification_preferences')
      .upsert({
        user_id,
        last_notification_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification: createdNotification 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error generating notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
