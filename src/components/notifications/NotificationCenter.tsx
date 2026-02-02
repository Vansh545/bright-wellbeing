import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  Check,
  CheckCheck, 
  Trash2, 
  Dumbbell,
  Heart,
  Trophy,
  Flame,
  Info,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Notification as NotificationType } from '@/hooks/useNotifications';
import { useNotifications, requestPushPermission } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const categoryIcons: Record<string, typeof Bell> = {
  general: Bell,
  workout: Dumbbell,
  health: Heart,
  streak: Flame,
  achievement: Trophy,
  weekly: Info,
};

const typeColors: Record<string, string> = {
  info: 'bg-health-blue/10 text-health-blue',
  success: 'bg-health-green/10 text-health-green',
  warning: 'bg-health-yellow/10 text-health-yellow',
  motivation: 'bg-health-purple/10 text-health-purple',
  reminder: 'bg-health-coral/10 text-health-coral',
};

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  const [pushEnabled, setPushEnabled] = useState(Notification.permission === 'granted');

  const handleEnablePush = async () => {
    const granted = await requestPushPermission();
    setPushEnabled(granted);
  };

  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold font-display">Notifications</h2>
                  <p className="text-xs text-muted-foreground">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Push notification prompt */}
            {!pushEnabled && 'Notification' in window && (
              <div className="p-4 bg-health-blue/5 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-health-blue" />
                    <span className="text-sm">Enable push notifications</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleEnablePush}>
                    Enable
                  </Button>
                </div>
              </div>
            )}

            {/* Notifications list */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Bell className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No notifications yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      We'll notify you about your progress
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const CategoryIcon = categoryIcons[notification.category] || Bell;
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className={`p-4 rounded-xl border transition-all ${
                          notification.is_read
                            ? 'bg-muted/30 border-border/50'
                            : 'bg-card border-border shadow-sm'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[notification.type]}`}>
                            <CategoryIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className={`font-medium text-sm ${notification.is_read ? 'text-muted-foreground' : ''}`}>
                                {notification.title}
                              </h3>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {!notification.is_read && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                  onClick={() => deleteNotification(notification.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <p className={`text-sm mt-1 ${notification.is_read ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.created_at)}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {notification.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
