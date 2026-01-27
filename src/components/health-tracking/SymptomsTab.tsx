import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Heart, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Symptom {
  id: string;
  name: string;
  severity: number;
  logged_at: string;
  notes: string | null;
}

interface SymptomsTabProps {
  symptoms: Symptom[];
  onAddSymptom: (symptom: Omit<Symptom, "id">) => Promise<void>;
  onDeleteSymptom: (id: string) => Promise<void>;
}

export function SymptomsTab({ symptoms, onAddSymptom, onDeleteSymptom }: SymptomsTabProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    severity: 5,
    notes: "",
  });
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      name: "",
      severity: 5,
      notes: "",
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Symptom name is required", variant: "destructive" });
      return;
    }

    try {
      await onAddSymptom({
        name: formData.name,
        severity: formData.severity,
        logged_at: new Date().toISOString(),
        notes: formData.notes || null,
      });
      toast({ title: "Success", description: "Symptom logged successfully" });
      resetForm();
      setIsAddDialogOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to log symptom", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteSymptom(id);
      toast({ title: "Success", description: "Symptom deleted successfully" });
    } catch {
      toast({ title: "Error", description: "Failed to delete symptom", variant: "destructive" });
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return "text-green-500";
    if (severity <= 6) return "text-yellow-500";
    return "text-red-500";
  };

  const getSeverityLabel = (severity: number) => {
    if (severity <= 3) return "Mild";
    if (severity <= 6) return "Moderate";
    return "Severe";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className="text-xl font-semibold text-foreground">Symptom Tracking</h2>
          <p className="text-sm text-muted-foreground">Record and monitor your symptoms</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Log Symptom
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Log New Symptom</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="symptom_name">Symptom</Label>
                <Input
                  id="symptom_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Headache, Fatigue"
                />
              </div>
              <div className="space-y-2">
                <Label>Severity: {formData.severity}/10 ({getSeverityLabel(formData.severity)})</Label>
                <Slider
                  value={[formData.severity]}
                  onValueChange={(value) => setFormData({ ...formData, severity: value[0] })}
                  min={1}
                  max={10}
                  step={1}
                  className="py-4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="symptom_notes">Notes (optional)</Label>
                <Textarea
                  id="symptom_notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional details..."
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Log Symptom
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Symptoms Card */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Recent Symptoms</CardTitle>
          <CardDescription>Your symptom history and patterns</CardDescription>
        </CardHeader>
        <CardContent>
          {symptoms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No symptoms logged yet.</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                Log Your First Symptom
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {symptoms.map((symptom, index) => (
                <motion.div
                  key={symptom.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-secondary ${getSeverityColor(symptom.severity)}`}>
                      <span className="font-bold">{symptom.severity}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{symptom.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(symptom.logged_at), "MMM dd, yyyy 'at' HH:mm")}
                      </p>
                      {symptom.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{symptom.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getSeverityColor(symptom.severity)}>
                      {getSeverityLabel(symptom.severity)}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(symptom.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
