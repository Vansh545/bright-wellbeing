import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { HealthOverviewTab } from "@/components/health-tracking/HealthOverviewTab";
import { ConditionsTab } from "@/components/health-tracking/ConditionsTab";
import { SymptomsTab } from "@/components/health-tracking/SymptomsTab";
import { MedicationsTab } from "@/components/health-tracking/MedicationsTab";
import { VitalSignsTab } from "@/components/health-tracking/VitalSignsTab";
import { HealthReportsSection } from "@/components/health-tracking/HealthReportsSection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { subDays } from "date-fns";

interface Condition {
  id: string;
  name: string;
  diagnosed_date: string | null;
  last_checkup: string | null;
  severity: string;
  status: string;
  notes: string | null;
}

interface Symptom {
  id: string;
  name: string;
  severity: number;
  logged_at: string;
  notes: string | null;
}

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

interface VitalSign {
  id: string;
  type: string;
  value: string;
  unit: string | null;
  recorded_at: string;
  notes: string | null;
}

export default function HealthTracking() {
  const [activeTab, setActiveTab] = useState("overview");
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [conditionsRes, symptomsRes, medicationsRes, vitalSignsRes] = await Promise.all([
        supabase.from("health_conditions").select("*").order("created_at", { ascending: false }),
        supabase.from("symptoms").select("*").order("logged_at", { ascending: false }),
        supabase.from("medications").select("*").order("created_at", { ascending: false }),
        supabase.from("vital_signs").select("*").order("recorded_at", { ascending: false }),
      ]);

      if (conditionsRes.data) setConditions(conditionsRes.data);
      if (symptomsRes.data) setSymptoms(symptomsRes.data);
      if (medicationsRes.data) setMedications(medicationsRes.data);
      if (vitalSignsRes.data) setVitalSigns(vitalSignsRes.data);
    } catch (error) {
      console.error("Error fetching health data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Conditions CRUD
  const handleAddCondition = async (condition: Omit<Condition, "id">) => {
    if (!user) return;
    const { error } = await supabase.from("health_conditions").insert({
      ...condition,
      user_id: user.id,
    });
    if (error) throw error;
    fetchData();
  };

  const handleUpdateCondition = async (id: string, condition: Partial<Condition>) => {
    const { error } = await supabase.from("health_conditions").update(condition).eq("id", id);
    if (error) throw error;
    fetchData();
  };

  const handleDeleteCondition = async (id: string) => {
    const { error } = await supabase.from("health_conditions").delete().eq("id", id);
    if (error) throw error;
    fetchData();
  };

  // Symptoms CRUD
  const handleAddSymptom = async (symptom: Omit<Symptom, "id">) => {
    if (!user) return;
    const { error } = await supabase.from("symptoms").insert({
      ...symptom,
      user_id: user.id,
    });
    if (error) throw error;
    fetchData();
  };

  const handleDeleteSymptom = async (id: string) => {
    const { error } = await supabase.from("symptoms").delete().eq("id", id);
    if (error) throw error;
    fetchData();
  };

  // Medications CRUD
  const handleAddMedication = async (medication: Omit<Medication, "id">) => {
    if (!user) return;
    const { error } = await supabase.from("medications").insert({
      ...medication,
      user_id: user.id,
    });
    if (error) throw error;
    fetchData();
  };

  const handleUpdateMedication = async (id: string, medication: Partial<Medication>) => {
    const { error } = await supabase.from("medications").update(medication).eq("id", id);
    if (error) throw error;
    fetchData();
  };

  const handleDeleteMedication = async (id: string) => {
    const { error } = await supabase.from("medications").delete().eq("id", id);
    if (error) throw error;
    fetchData();
  };

  // Vital Signs CRUD
  const handleAddVitalSign = async (vitalSign: Omit<VitalSign, "id">) => {
    if (!user) return;
    const { error } = await supabase.from("vital_signs").insert({
      ...vitalSign,
      user_id: user.id,
    });
    if (error) throw error;
    fetchData();
  };

  const handleDeleteVitalSign = async (id: string) => {
    const { error } = await supabase.from("vital_signs").delete().eq("id", id);
    if (error) throw error;
    fetchData();
  };

  // Generate health report
  const handleGenerateReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      conditions,
      symptoms,
      medications: medications.filter((m) => m.is_active),
      vitalSigns: vitalSigns.slice(0, 20),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `health-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Report Generated", description: "Your health report has been downloaded." });
  };

  // Calculate symptoms this week
  const symptomsThisWeek = symptoms.filter(
    (s) => new Date(s.logged_at) >= subDays(new Date(), 7)
  ).length;

  // Build recent activity
  const recentActivity = [
    ...vitalSigns.slice(0, 5).map((v) => ({
      id: v.id,
      type: v.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value: `${v.value} ${v.unit || ""}`,
      date: v.recorded_at,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageTransition>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Health Tracking</h1>
              <p className="text-muted-foreground">Monitor your health conditions, symptoms, and vital signs</p>
            </div>
            <Button className="gap-2 hidden md:flex">
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-5 h-auto">
              <TabsTrigger value="overview" className="py-3">Overview</TabsTrigger>
              <TabsTrigger value="conditions" className="py-3">Conditions</TabsTrigger>
              <TabsTrigger value="symptoms" className="py-3">Symptoms</TabsTrigger>
              <TabsTrigger value="medications" className="py-3">Medications</TabsTrigger>
              <TabsTrigger value="vitals" className="py-3">Vital Signs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <HealthOverviewTab
                conditionsCount={conditions.filter((c) => c.status === "active").length}
                symptomsThisWeek={symptomsThisWeek}
                medicationsCount={medications.filter((m) => m.is_active).length}
                vitalSignsCount={vitalSigns.length}
                recentActivity={recentActivity}
                onGenerateReport={handleGenerateReport}
              />
            </TabsContent>

            <TabsContent value="conditions" className="mt-6 space-y-6">
              <ConditionsTab
                conditions={conditions}
                onAddCondition={handleAddCondition}
                onUpdateCondition={handleUpdateCondition}
                onDeleteCondition={handleDeleteCondition}
              />
              <HealthReportsSection onGenerateReport={handleGenerateReport} />
            </TabsContent>

            <TabsContent value="symptoms" className="mt-6 space-y-6">
              <SymptomsTab
                symptoms={symptoms}
                onAddSymptom={handleAddSymptom}
                onDeleteSymptom={handleDeleteSymptom}
              />
              <HealthReportsSection onGenerateReport={handleGenerateReport} />
            </TabsContent>

            <TabsContent value="medications" className="mt-6 space-y-6">
              <MedicationsTab
                medications={medications}
                onAddMedication={handleAddMedication}
                onUpdateMedication={handleUpdateMedication}
                onDeleteMedication={handleDeleteMedication}
              />
              <HealthReportsSection onGenerateReport={handleGenerateReport} />
            </TabsContent>

            <TabsContent value="vitals" className="mt-6 space-y-6">
              <VitalSignsTab
                vitalSigns={vitalSigns}
                onAddVitalSign={handleAddVitalSign}
                onDeleteVitalSign={handleDeleteVitalSign}
              />
              <HealthReportsSection onGenerateReport={handleGenerateReport} />
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
