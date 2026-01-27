import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pill, Clock, Edit, Bell, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Medication {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string;
  condition: string | null;
  started_date: string | null;
  instructions: string | null;
  is_active: boolean;
}

interface MedicationsTabProps {
  medications: Medication[];
  onAddMedication: (medication: Omit<Medication, "id">) => Promise<void>;
  onUpdateMedication: (id: string, medication: Partial<Medication>) => Promise<void>;
  onDeleteMedication: (id: string) => Promise<void>;
}

export function MedicationsTab({ medications, onAddMedication, onUpdateMedication, onDeleteMedication }: MedicationsTabProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "once daily",
    condition: "",
    started_date: "",
    instructions: "",
    is_active: true,
  });
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      name: "",
      dosage: "",
      frequency: "once daily",
      condition: "",
      started_date: "",
      instructions: "",
      is_active: true,
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Medication name is required", variant: "destructive" });
      return;
    }

    try {
      if (editingMedication) {
        await onUpdateMedication(editingMedication.id, formData);
        toast({ title: "Success", description: "Medication updated successfully" });
      } else {
        await onAddMedication(formData);
        toast({ title: "Success", description: "Medication added successfully" });
      }
      resetForm();
      setIsAddDialogOpen(false);
      setEditingMedication(null);
    } catch {
      toast({ title: "Error", description: "Failed to save medication", variant: "destructive" });
    }
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setFormData({
      name: medication.name,
      dosage: medication.dosage || "",
      frequency: medication.frequency,
      condition: medication.condition || "",
      started_date: medication.started_date || "",
      instructions: medication.instructions || "",
      is_active: medication.is_active,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteMedication(id);
      toast({ title: "Success", description: "Medication deleted successfully" });
    } catch {
      toast({ title: "Error", description: "Failed to delete medication", variant: "destructive" });
    }
  };

  const activeMedications = medications.filter((m) => m.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className="text-xl font-semibold text-foreground">Medication Management</h2>
          <p className="text-sm text-muted-foreground">Track your medications and dosages</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setEditingMedication(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingMedication ? "Edit Medication" : "Add New Medication"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="med_name">Medication Name</Label>
                <Input
                  id="med_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Lisinopril"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g., 10mg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once daily">Once daily</SelectItem>
                      <SelectItem value="twice daily">Twice daily</SelectItem>
                      <SelectItem value="three times daily">Three times daily</SelectItem>
                      <SelectItem value="as needed">As needed</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="condition">For Condition</Label>
                  <Input
                    id="condition"
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    placeholder="e.g., Hypertension"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="started_date">Started Date</Label>
                  <Input
                    id="started_date"
                    type="date"
                    value={formData.started_date}
                    onChange={(e) => setFormData({ ...formData, started_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="e.g., Take in morning with food"
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingMedication ? "Update Medication" : "Add Medication"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Medications List */}
      {activeMedications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No medications added yet.</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
            Add Your First Medication
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {activeMedications.map((medication, index) => (
            <motion.div
              key={medication.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Pill className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">{medication.name}</h3>
                    </div>
                    <Badge variant="outline">{medication.frequency}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {medication.dosage && (
                      <div>
                        <p className="text-xs text-muted-foreground">Dosage</p>
                        <p className="font-medium text-foreground">{medication.dosage}</p>
                      </div>
                    )}
                    {medication.condition && (
                      <div>
                        <p className="text-xs text-muted-foreground">Condition</p>
                        <p className="font-medium text-primary">{medication.condition}</p>
                      </div>
                    )}
                    {medication.started_date && (
                      <div>
                        <p className="text-xs text-muted-foreground">Started</p>
                        <p className="font-medium text-foreground">
                          {format(new Date(medication.started_date), "yyyy-MM-dd")}
                        </p>
                      </div>
                    )}
                  </div>
                  {medication.instructions && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 mb-4">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{medication.instructions}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => handleEdit(medication)}>
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Bell className="h-4 w-4" />
                      Set Reminder
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive" onClick={() => handleDelete(medication.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
