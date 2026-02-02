import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Sparkles,
  ArrowRight,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useActivityLogs, getSmartRecommendations } from '@/hooks/useActivityLogs';

export function SmartInsights() {
  const { profile, streak } = useUserProfile();
  const { getWeeklyStats } = useActivityLogs();
  
  const weeklyStats = getWeeklyStats();
  const recommendations = getSmartRecommendations(profile, weeklyStats, streak);

  // Generate insights based on data
  const insights: Array<{
    type: 'positive' | 'neutral' | 'action';
    icon: typeof Flame;
    title: string;
    message: string;
    link?: string;
  }> = [];

  // Activity comparison
  if (weeklyStats.totalWorkouts > 0) {
    if (weeklyStats.activeDays >= 4) {
      insights.push({
        type: 'positive',
        icon: TrendingUp,
        title: 'Great Consistency! 🎯',
        message: `You've been active ${weeklyStats.activeDays} days this week. Keep it up!`,
      });
    } else if (weeklyStats.activeDays < 3) {
      insights.push({
        type: 'action',
        icon: TrendingDown,
        title: 'Let\'s Pick Up the Pace',
        message: `Only ${weeklyStats.activeDays} active days this week. Small steps count!`,
        link: '/fitness',
      });
    }
  }

  // Streak insights
  if (streak) {
    if (streak.current_streak >= 7) {
      insights.push({
        type: 'positive',
        icon: Flame,
        title: `${streak.current_streak} Day Streak! 🔥`,
        message: 'You\'re on fire! This consistency is building real results.',
      });
    } else if (streak.current_streak === 0) {
      insights.push({
        type: 'action',
        icon: Zap,
        title: 'Start Fresh Today',
        message: 'Every journey begins with a single step. Log an activity!',
        link: '/fitness',
      });
    }
  }

  // Add recommendations
  recommendations.slice(0, 2).forEach(rec => {
    insights.push({
      type: rec.type === 'workout' ? 'action' : 'neutral',
      icon: rec.type === 'rest' ? Sparkles : Lightbulb,
      title: rec.title,
      message: rec.message,
      link: rec.type === 'workout' ? '/fitness' : undefined,
    });
  });

  if (insights.length === 0) {
    insights.push({
      type: 'neutral',
      icon: Lightbulb,
      title: 'Welcome! 👋',
      message: 'Start tracking your activities to get personalized insights.',
      link: '/fitness',
    });
  }

  const typeStyles = {
    positive: 'bg-health-green/10 border-health-green/20',
    neutral: 'bg-health-blue/10 border-health-blue/20',
    action: 'bg-health-coral/10 border-health-coral/20',
  };

  const iconStyles = {
    positive: 'text-health-green',
    neutral: 'text-health-blue',
    action: 'text-health-coral',
  };

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl gradient-purple flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-primary-foreground" />
          </div>
          Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.slice(0, 3).map((insight, index) => {
          const InsightIcon = insight.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border ${typeStyles[insight.type]}`}
            >
              <div className="flex items-start gap-3">
                <div className={`h-8 w-8 rounded-lg bg-background/50 flex items-center justify-center ${iconStyles[insight.type]}`}>
                  <InsightIcon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{insight.message}</p>
                  {insight.link && (
                    <Link to={insight.link}>
                      <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-xs">
                        Take action <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
