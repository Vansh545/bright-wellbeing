import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Heart, Activity, Thermometer, Scale, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface VitalSign {
  id: string;
  type: string;
  value: string;
  unit: string | null;
  recorded_at: string;
  notes: string | null;
}

interface VitalSignsTabProps {
  vitalSigns: VitalSign[];
  onAddVitalSign: (vitalSign: Omit<VitalSign, "id">) => Promise<void>;
  onDeleteVitalSign: (id: string) => Promise<void>;
}

const vitalSignTypes = [
  { value: "blood_pressure", label: "Blood Pressure", unit: "mmHg", icon: Heart },
  { value: "heart_rate", label: "Heart Rate", unit: "bpm", icon: Activity },
  { value: "temperature", label: "Temperature", unit: "°F", icon: Thermometer },
  { value: "weight", label: "Weight", unit: "lbs", icon: Scale },
  { value: "blood_sugar", label: "Blood Sugar", unit: "mg/dL", icon: Activity },
  { value: "oxygen_saturation", label: "Oxygen Saturation", unit: "%", icon: Activity },
];

export function VitalSignsTab({ vitalSigns, onAddVitalSign, onDeleteVitalSign }: VitalSignsTabProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "blood_pressure",
    value: "",
    notes: "",
  });
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      type: "blood_pressure",
      value: "",
      notes: "",
    });
  };

  const handleSubmit = async () => {
    if (!formData.value.trim()) {
      toast({ title: "Error", description: "Value is required", variant: "destructive" });
      return;
    }

    const selectedType = vitalSignTypes.find((t) => t.value === formData.type);

    try {
      await onAddVitalSign({
        type: formData.type,
        value: formData.value,
        unit: selectedType?.unit || null,
        recorded_at: new Date().toISOString(),
        notes: formData.notes || null,
      });
      toast({ title: "Success", description: "Vital sign recorded successfully" });
      resetForm();
      setIsAddDialogOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to record vital sign", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteVitalSign(id);
      toast({ title: "Success", description: "Vital sign deleted successfully" });
    } catch {
      toast({ title: "Error", description: "Failed to delete vital sign", variant: "destructive" });
    }
  };

  const getVitalSignIcon = (type: string) => {
    const typeConfig = vitalSignTypes.find((t) => t.value === type);
    if (!typeConfig) return Activity;
    return typeConfig.icon;
  };

  const getVitalSignLabel = (type: string) => {
    const typeConfig = vitalSignTypes.find((t) => t.value === type);
    return typeConfig?.label || type;
  };

  const getVitalSignStatus = (type: string, value: string) => {
    // Simple status logic - in real app, this would be more sophisticated
    switch (type) {
      case "blood_pressure":
        return "Normal reading";
      case "heart_rate":
        const hr = parseInt(value);
        if (hr >= 60 && hr <= 100) return "Resting heart rate";
        return hr < 60 ? "Low heart rate" : "Elevated heart rate";
      case "temperature":
        const temp = parseFloat(value);
        if (temp >= 97 && temp <= 99) return "Normal body temperature";
        return temp < 97 ? "Low temperature" : "Elevated temperature";
      case "weight":
        return "Weekly weigh-in";
      default:
        return "Recorded";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "blood_pressure":
        return "text-rose-500";
      case "heart_rate":
        return "text-pink-500";
      case "temperature":
        return "text-orange-500";
      case "weight":
        return "text-blue-500";
      default:
        return "text-primary";
    }
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
          <h2 className="text-xl font-semibold text-foreground">Vital Signs</h2>
          <p className="text-sm text-muted-foreground">Monitor your vital signs and health metrics</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Record Vital Sign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Record Vital Sign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vitalSignTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vital_value">
                  Value ({vitalSignTypes.find((t) => t.value === formData.type)?.unit})
                </Label>
                <Input
                  id="vital_value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={formData.type === "blood_pressure" ? "e.g., 120/80" : "Enter value"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vital_notes">Notes (optional)</Label>
                <Textarea
                  id="vital_notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Record Vital Sign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Vital Signs Card */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Recorded Vital Signs</CardTitle>
          <CardDescription>Your health metrics history</CardDescription>
        </CardHeader>
        <CardContent>
          {vitalSigns.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No vital signs recorded yet.</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                Record Your First Vital Sign
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {vitalSigns.map((vitalSign, index) => {
                const Icon = getVitalSignIcon(vitalSign.type);
                return (
                  <motion.div
                    key={vitalSign.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${getIconColor(vitalSign.type)}`} />
                      <div>
                        <p className="font-medium text-foreground">{getVitalSignLabel(vitalSign.type)}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(vitalSign.recorded_at), "yyyy-MM-dd 'at' HH:mm")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-foreground">
                          {vitalSign.value} {vitalSign.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getVitalSignStatus(vitalSign.type, vitalSign.value)}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(vitalSign.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
