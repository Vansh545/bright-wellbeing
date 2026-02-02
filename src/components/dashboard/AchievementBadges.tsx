import { motion } from 'framer-motion';
import { 
  Trophy, 
  Flame, 
  Target, 
  Zap, 
  Star, 
  Medal,
  Award,
  Crown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useUserProfile } from '@/hooks/useUserProfile';

const allBadges = [
  { 
    id: 'first_workout', 
    name: 'First Steps', 
    description: 'Logged your first workout', 
    icon: Star,
    color: 'bg-health-yellow',
    requirement: (activities: number, streak: number) => activities >= 1,
  },
  { 
    id: 'streak_3', 
    name: 'On a Roll', 
    description: '3 day streak', 
    icon: Flame,
    color: 'bg-health-coral',
    requirement: (activities: number, streak: number) => streak >= 3,
  },
  { 
    id: 'streak_7', 
    name: 'Week Warrior', 
    description: '7 day streak', 
    icon: Flame,
    color: 'bg-health-coral',
    requirement: (activities: number, streak: number) => streak >= 7,
  },
  { 
    id: 'streak_30', 
    name: 'Unstoppable', 
    description: '30 day streak', 
    icon: Crown,
    color: 'bg-health-purple',
    requirement: (activities: number, streak: number) => streak >= 30,
  },
  { 
    id: 'workouts_10', 
    name: 'Dedicated', 
    description: '10 workouts completed', 
    icon: Target,
    color: 'bg-health-teal',
    requirement: (activities: number) => activities >= 10,
  },
  { 
    id: 'workouts_50', 
    name: 'Fitness Pro', 
    description: '50 workouts completed', 
    icon: Medal,
    color: 'bg-health-blue',
    requirement: (activities: number) => activities >= 50,
  },
  { 
    id: 'workouts_100', 
    name: 'Centurion', 
    description: '100 workouts completed', 
    icon: Award,
    color: 'bg-health-green',
    requirement: (activities: number) => activities >= 100,
  },
  { 
    id: 'early_bird', 
    name: 'Early Bird', 
    description: 'Morning workout before 7am', 
    icon: Zap,
    color: 'bg-health-yellow',
    requirement: () => false, // Special condition checked separately
  },
];

export function AchievementBadges() {
  const { activities, achievements } = useActivityLogs();
  const { streak } = useUserProfile();

  const totalActivities = activities.length;
  const currentStreak = streak?.current_streak || 0;

  // Calculate earned badges
  const earnedBadgeIds = new Set(achievements.map(a => a.achievement_type));
  
  // Also check which badges should be earned based on current stats
  const eligibleBadges = allBadges.filter(badge => 
    badge.requirement(totalActivities, currentStreak) || earnedBadgeIds.has(badge.id)
  );

  const lockedBadges = allBadges.filter(badge => 
    !badge.requirement(totalActivities, currentStreak) && !earnedBadgeIds.has(badge.id)
  );

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl gradient-accent flex items-center justify-center">
            <Trophy className="h-4 w-4 text-primary-foreground" />
          </div>
          Achievements
          <span className="text-sm font-normal text-muted-foreground ml-auto">
            {eligibleBadges.length}/{allBadges.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          {/* Earned badges */}
          {eligibleBadges.map((badge, index) => {
            const BadgeIcon = badge.icon;
            return (
              <motion.div
                key={badge.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, type: 'spring' }}
                className="relative group"
              >
                <div className={`${badge.color} h-14 w-14 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <BadgeIcon className="h-7 w-7 text-primary-foreground" />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-foreground text-background text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    <p className="font-medium">{badge.name}</p>
                    <p className="text-background/70">{badge.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Locked badges - show first 4 */}
          {lockedBadges.slice(0, 4 - eligibleBadges.length).map((badge) => {
            const BadgeIcon = badge.icon;
            return (
              <div
                key={badge.id}
                className="relative group"
              >
                <div className="bg-muted h-14 w-14 rounded-2xl flex items-center justify-center opacity-40">
                  <BadgeIcon className="h-7 w-7 text-muted-foreground" />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-foreground text-background text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    <p className="font-medium">{badge.name}</p>
                    <p className="text-background/70">{badge.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
