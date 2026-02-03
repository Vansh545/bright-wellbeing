import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { showLocalNotification, requestPushPermission } from '@/hooks/useNotifications';

export interface NotificationPreferences {
  id: string;
  user_id: string;
  push_enabled: boolean;
  morning_enabled: boolean;
  activity_reminders: boolean;
  wellness_tips: boolean;
  progress_updates: boolean;
  evening_reflection: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  timezone: string;
  last_notification_at: string | null;
}

// Smart intervals: notifications at natural break points throughout the day
const NOTIFICATION_INTERVALS = [
  { hour: 8, type: 'morning' },
  { hour: 10, type: 'activity' },
  { hour: 12, type: 'wellness' },
  { hour: 15, type: 'progress' },
  { hour: 18, type: 'activity' },
  { hour: 21, type: 'evening' },
];

export function useSmartNotifications() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<string | null>(null);

  // Fetch notification preferences
  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No preferences found, create default
        const { data: newPrefs } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            push_enabled: true,
            morning_enabled: true,
            activity_reminders: true,
            wellness_tips: true,
            progress_updates: true,
            evening_reflection: true,
          })
          .select()
          .single();

        if (newPrefs) {
          setPreferences(newPrefs as NotificationPreferences);
        }
      } else if (data) {
        setPreferences(data as NotificationPreferences);
      }
    } catch (err) {
      console.error('Error fetching notification preferences:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // Update preferences
  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    if (!user || !preferences) return;

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id);

      if (!error) {
        setPreferences(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (err) {
      console.error('Error updating preferences:', err);
    }
  }, [user, preferences]);

  // Enable push notifications
  const enablePushNotifications = useCallback(async () => {
    const granted = await requestPushPermission();
    if (granted) {
      await updatePreferences({ push_enabled: true });
    }
    return granted;
  }, [updatePreferences]);

  // Generate a notification via edge function
  const generateNotification = useCallback(async (context?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('generate-notifications', {
        body: { user_id: user.id, context },
      });

      if (error) throw error;

      if (data?.notification && preferences?.push_enabled) {
        showLocalNotification(data.notification.title, {
          body: data.notification.message,
          tag: data.notification.category,
        });
      }

      return data?.notification;
    } catch (err) {
      console.error('Error generating notification:', err);
      return null;
    }
  }, [user, preferences]);

  // Check if it's time for a notification
  const checkNotificationSchedule = useCallback(() => {
    if (!preferences || !preferences.push_enabled) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentKey = `${now.toDateString()}-${currentHour}`;

    // Don't repeat notifications for the same hour
    if (lastCheckRef.current === currentKey) return;

    // Find matching interval
    const matchingInterval = NOTIFICATION_INTERVALS.find(interval => {
      if (interval.hour !== currentHour) return false;

      // Check preference for this notification type
      switch (interval.type) {
        case 'morning':
          return preferences.morning_enabled;
        case 'activity':
          return preferences.activity_reminders;
        case 'wellness':
          return preferences.wellness_tips;
        case 'progress':
          return preferences.progress_updates;
        case 'evening':
          return preferences.evening_reflection;
        default:
          return true;
      }
    });

    if (matchingInterval) {
      lastCheckRef.current = currentKey;
      generateNotification(matchingInterval.type);
    }
  }, [preferences, generateNotification]);

  // Start notification scheduler
  useEffect(() => {
    if (!user || !preferences) return;

    // Check immediately
    checkNotificationSchedule();

    // Check every 15 minutes
    intervalRef.current = setInterval(checkNotificationSchedule, 15 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, preferences, checkNotificationSchedule]);

  // Send immediate notification (for testing or manual triggers)
  const sendImmediateNotification = useCallback(async (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'motivation' | 'reminder' = 'info',
    category: 'general' | 'workout' | 'health' | 'streak' | 'achievement' | 'weekly' = 'general'
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title,
          message,
          type,
          category,
        })
        .select()
        .single();

      if (error) throw error;

      if (preferences?.push_enabled) {
        showLocalNotification(title, { body: message, tag: category });
      }

      return data;
    } catch (err) {
      console.error('Error sending notification:', err);
      return null;
    }
  }, [user, preferences]);

  return {
    preferences,
    loading,
    updatePreferences,
    enablePushNotifications,
    generateNotification,
    sendImmediateNotification,
    refetch: fetchPreferences,
  };
}
