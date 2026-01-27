import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

interface HealthReportsSectionProps {
  onGenerateReport: () => void;
}

export function HealthReportsSection({ onGenerateReport }: HealthReportsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
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
  );
}
