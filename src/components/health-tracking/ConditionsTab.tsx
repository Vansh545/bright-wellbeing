import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, AlertTriangle, Edit, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Condition {
  id: string;
  name: string;
  diagnosed_date: string | null;
  last_checkup: string | null;
  severity: string;
  status: string;
  notes: string | null;
}

interface ConditionsTabProps {
  conditions: Condition[];
  onAddCondition: (condition: Omit<Condition, "id">) => Promise<void>;
  onUpdateCondition: (id: string, condition: Partial<Condition>) => Promise<void>;
  onDeleteCondition: (id: string) => Promise<void>;
}

export function ConditionsTab({ conditions, onAddCondition, onUpdateCondition, onDeleteCondition }: ConditionsTabProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCondition, setEditingCondition] = useState<Condition | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    diagnosed_date: "",
    last_checkup: "",
    severity: "mild",
    status: "active",
    notes: "",
  });
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      name: "",
      diagnosed_date: "",
      last_checkup: "",
      severity: "mild",
      status: "active",
      notes: "",
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Condition name is required", variant: "destructive" });
      return;
    }

    try {
      if (editingCondition) {
        await onUpdateCondition(editingCondition.id, formData);
        toast({ title: "Success", description: "Condition updated successfully" });
      } else {
        await onAddCondition(formData);
        toast({ title: "Success", description: "Condition added successfully" });
      }
      resetForm();
      setIsAddDialogOpen(false);
      setEditingCondition(null);
    } catch {
      toast({ title: "Error", description: "Failed to save condition", variant: "destructive" });
    }
  };

  const handleEdit = (condition: Condition) => {
    setEditingCondition(condition);
    setFormData({
      name: condition.name,
      diagnosed_date: condition.diagnosed_date || "",
      last_checkup: condition.last_checkup || "",
      severity: condition.severity,
      status: condition.status,
      notes: condition.notes || "",
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteCondition(id);
      toast({ title: "Success", description: "Condition deleted successfully" });
    } catch {
      toast({ title: "Error", description: "Failed to delete condition", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "destructive",
      managed: "default",
      resolved: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    return (
      <Badge variant="outline" className="capitalize">
        {severity}
      </Badge>
    );
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
          <h2 className="text-xl font-semibold text-foreground">Health Conditions</h2>
          <p className="text-sm text-muted-foreground">Manage your diagnosed conditions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setEditingCondition(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Condition
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingCondition ? "Edit Condition" : "Add New Condition"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Condition Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Hypertension"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="diagnosed_date">Diagnosed Date</Label>
                  <Input
                    id="diagnosed_date"
                    type="date"
                    value={formData.diagnosed_date}
                    onChange={(e) => setFormData({ ...formData, diagnosed_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_checkup">Last Checkup</Label>
                  <Input
                    id="last_checkup"
                    type="date"
                    value={formData.last_checkup}
                    onChange={(e) => setFormData({ ...formData, last_checkup: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="managed">Managed</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingCondition ? "Update Condition" : "Add Condition"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Conditions List */}
      {conditions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No conditions logged yet.</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
            Add Your First Condition
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {conditions.map((condition, index) => (
            <motion.div
              key={condition.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{condition.name}</h3>
                    {getStatusBadge(condition.status)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {condition.diagnosed_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <div>
                          <p className="text-xs">Diagnosed</p>
                          <p className="text-foreground">{format(new Date(condition.diagnosed_date), "yyyy-MM-dd")}</p>
                        </div>
                      </div>
                    )}
                    {condition.last_checkup && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <div>
                          <p className="text-xs">Last Checkup</p>
                          <p className="text-foreground">{format(new Date(condition.last_checkup), "yyyy-MM-dd")}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="h-4 w-4" />
                      <div>
                        <p className="text-xs">Severity</p>
                        {getSeverityBadge(condition.severity)}
                      </div>
                    </div>
                  </div>
                  {condition.notes && (
                    <p className="text-sm text-muted-foreground mb-4">{condition.notes}</p>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => handleEdit(condition)}>
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive" onClick={() => handleDelete(condition.id)}>
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
