import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Heart, Pill, Activity, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface HealthOverviewTabProps {
  conditionsCount: number;
  symptomsThisWeek: number;
  medicationsCount: number;
  vitalSignsCount: number;
  recentActivity: Array<{
    id: string;
    type: string;
    value: string;
    date: string;
  }>;
  onGenerateReport: () => void;
}

export function HealthOverviewTab({
  conditionsCount,
  symptomsThisWeek,
  medicationsCount,
  vitalSignsCount,
  recentActivity,
  onGenerateReport,
}: HealthOverviewTabProps) {
  // Calculate health score based on data
  const calculateHealthScore = () => {
    let score = 100;
    score -= conditionsCount * 5;
    score -= symptomsThisWeek * 3;
    score += Math.min(vitalSignsCount * 2, 10);
    score += medicationsCount > 0 ? 5 : 0;
    return Math.max(0, Math.min(100, score));
  };

  const healthScore = calculateHealthScore();

  const getHealthStatus = () => {
    if (healthScore >= 80) return "Excellent health status";
    if (healthScore >= 60) return "Good health status";
    if (healthScore >= 40) return "Fair health status";
    return "Needs attention";
  };

  const stats = [
    { icon: AlertTriangle, label: "Active Conditions", value: conditionsCount, color: "text-yellow-500" },
    { icon: Heart, label: "Symptoms This Week", value: symptomsThisWeek, color: "text-rose-500" },
    { icon: Pill, label: "Active Medications", value: medicationsCount, color: "text-green-500" },
    { icon: Activity, label: "Vital Sign Readings", value: vitalSignsCount, color: "text-blue-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Health Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Health Score</CardTitle>
            </div>
            <CardDescription>Overall health assessment based on your tracked data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Progress value={healthScore} className="h-3" />
              </div>
              <span className="text-2xl font-bold text-foreground">{healthScore}/100</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{getHealthStatus()}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <Card className="glass-card border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest health tracking entries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recent activity yet.</p>
                <p className="text-sm">Start tracking your health data.</p>
              </div>
            ) : (
              recentActivity.map((activity) => (
                <motion.div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Activity className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {activity.type}: {activity.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(activity.date), "dd/MM/yyyy")}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Health Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="glass-card border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Health Reports</CardTitle>
            </div>
            <CardDescription>Generate comprehensive health reports for healthcare providers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Export your health data including conditions, symptoms, medications, and vital signs
              </p>
              <Button onClick={onGenerateReport} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
