import { motion } from 'framer-motion';
import { Footprints, TrendingUp, Target, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useStepTracking } from '@/hooks/useStepTracking';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

export function StepSummaryCard() {
  const { stepData, loading } = useStepTracking();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="glass-card cursor-pointer hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isGoalReached = stepData.percentage >= 100;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate('/fitness')}
      className="cursor-pointer"
    >
      <Card className="glass-card hover:shadow-lg transition-shadow overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <motion.div
              className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                isGoalReached ? 'bg-health-green/10' : 'bg-health-blue/10'
              }`}
              animate={{ 
                scale: isGoalReached ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.5, repeat: isGoalReached ? Infinity : 0, repeatDelay: 2 }}
            >
              <Footprints className={`h-6 w-6 ${isGoalReached ? 'text-health-green' : 'text-health-blue'}`} />
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Today's Steps</span>
                {isGoalReached && (
                  <span className="text-xs text-health-green font-medium flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    Goal!
                  </span>
                )}
              </div>
              
              <div className="flex items-baseline gap-2">
                <motion.span
                  key={stepData.steps}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold"
                >
                  {stepData.steps.toLocaleString()}
                </motion.span>
                <span className="text-sm text-muted-foreground">
                  / {stepData.goalSteps.toLocaleString()}
                </span>
              </div>

              <div className="mt-2">
                <Progress 
                  value={Math.min(stepData.percentage, 100)} 
                  className="h-2"
                />
              </div>

              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground capitalize">
                  via {stepData.source.replace('_', ' ')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(stepData.percentage)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
