import { motion } from 'framer-motion';
import { Bell, Moon, Clock, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSmartNotifications } from '@/hooks/useSmartNotifications';
import { Skeleton } from '@/components/ui/skeleton';

export function NotificationSettings() {
  const { 
    preferences, 
    loading, 
    updatePreferences, 
    enablePushNotifications,
    sendImmediateNotification 
  } = useSmartNotifications();

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">Please log in to manage notification settings.</p>
        </CardContent>
      </Card>
    );
  }

  const handleEnablePush = async () => {
    await enablePushNotifications();
  };

  const handleTestNotification = async () => {
    await sendImmediateNotification(
      'Test Notification 🔔',
      'Your notifications are working perfectly!',
      'success',
      'general'
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-health-blue" />
            Smart Notifications
          </CardTitle>
          <CardDescription>
            Configure when and how you receive wellness reminders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-health-blue/10 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-health-blue" />
              </div>
              <div>
                <Label className="text-base font-medium">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications on your device
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.push_enabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleEnablePush();
                } else {
                  updatePreferences({ push_enabled: false });
                }
              }}
            />
          </div>

          {/* Notification types */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Notification Types
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Morning Motivation</Label>
                  <p className="text-xs text-muted-foreground">Start your day with positivity</p>
                </div>
                <Switch
                  checked={preferences.morning_enabled}
                  onCheckedChange={(checked) => updatePreferences({ morning_enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Activity Reminders</Label>
                  <p className="text-xs text-muted-foreground">Gentle nudges to stay active</p>
                </div>
                <Switch
                  checked={preferences.activity_reminders}
                  onCheckedChange={(checked) => updatePreferences({ activity_reminders: checked })}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Wellness Tips</Label>
                  <p className="text-xs text-muted-foreground">Health and wellness advice</p>
                </div>
                <Switch
                  checked={preferences.wellness_tips}
                  onCheckedChange={(checked) => updatePreferences({ wellness_tips: checked })}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Progress Updates</Label>
                  <p className="text-xs text-muted-foreground">Celebrate your achievements</p>
                </div>
                <Switch
                  checked={preferences.progress_updates}
                  onCheckedChange={(checked) => updatePreferences({ progress_updates: checked })}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Evening Reflection</Label>
                  <p className="text-xs text-muted-foreground">End-of-day check-in reminders</p>
                </div>
                <Switch
                  checked={preferences.evening_reflection}
                  onCheckedChange={(checked) => updatePreferences({ evening_reflection: checked })}
                />
              </div>
            </div>
          </div>

          {/* Quiet hours */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Quiet Hours
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Start
                </Label>
                <Input
                  type="time"
                  value={preferences.quiet_hours_start || '22:00'}
                  onChange={(e) => updatePreferences({ quiet_hours_start: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  End
                </Label>
                <Input
                  type="time"
                  value={preferences.quiet_hours_end || '07:00'}
                  onChange={(e) => updatePreferences({ quiet_hours_end: e.target.value })}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              No notifications will be sent during quiet hours
            </p>
          </div>

          {/* Test notification */}
          <div className="pt-4 border-t border-border">
            <Button 
              variant="outline" 
              onClick={handleTestNotification}
              className="w-full"
            >
              Send Test Notification
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
