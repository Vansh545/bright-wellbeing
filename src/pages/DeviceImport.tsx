import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileUp,
  Download,
  Check,
  AlertCircle,
  Clock,
  Heart,
  Footprints,
  Moon,
  Scale,
  Plus,
  Trash2,
  Calendar,
  HelpCircle,
  Smartphone,
  Watch,
} from "lucide-react";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ManualEntry {
  id: string;
  date: Date;
  steps: number;
  heartRate: number;
  sleep: number;
  weight: number;
}

interface ImportHistory {
  id: string;
  filename: string;
  date: Date;
  records: number;
  status: "success" | "error" | "pending";
}

const supportedDevices = [
  { name: "Apple Watch", icon: Watch },
  { name: "Fitbit", icon: Watch },
  { name: "Garmin", icon: Watch },
  { name: "Samsung Galaxy Watch", icon: Watch },
  { name: "Google Fit", icon: Smartphone },
  { name: "Oura Ring", icon: Watch },
];

const sampleCSV = `date,steps,heart_rate,sleep_hours,weight
2024-12-16,8500,72,7.5,165
2024-12-15,10200,68,8,165.2
2024-12-14,6800,75,6.5,164.8`;

const initialImportHistory: ImportHistory[] = [
  { id: "1", filename: "fitbit_export_dec.csv", date: new Date(Date.now() - 86400000), records: 14, status: "success" },
  { id: "2", filename: "apple_health_sync.csv", date: new Date(Date.now() - 172800000), records: 7, status: "success" },
];

export default function DeviceImport() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [steps, setSteps] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [sleep, setSleep] = useState("");
  const [weight, setWeight] = useState("");
  const [manualEntries, setManualEntries] = useState<ManualEntry[]>([]);
  const [importHistory, setImportHistory] = useState<ImportHistory[]>(initialImportHistory);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedData, setUploadedData] = useState<any[] | null>(null);

  const handleAddEntry = () => {
    if (!steps && !heartRate && !sleep && !weight) {
      toast({
        title: "No Data",
        description: "Please enter at least one measurement.",
        variant: "destructive",
      });
      return;
    }

    const newEntry: ManualEntry = {
      id: Date.now().toString(),
      date,
      steps: parseInt(steps) || 0,
      heartRate: parseInt(heartRate) || 0,
      sleep: parseFloat(sleep) || 0,
      weight: parseFloat(weight) || 0,
    };

    setManualEntries([newEntry, ...manualEntries]);
    setSteps("");
    setHeartRate("");
    setSleep("");
    setWeight("");

    toast({
      title: "Entry Added!",
      description: "Your health data has been recorded.",
    });
  };

  const handleDeleteEntry = (id: string) => {
    setManualEntries(manualEntries.filter((e) => e.id !== id));
    toast({ title: "Entry deleted" });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter(Boolean);
      const headers = lines[0].split(",");
      const data = lines.slice(1).map((line) => {
        const values = line.split(",");
        return headers.reduce((obj, header, i) => {
          obj[header.trim()] = values[i]?.trim();
          return obj;
        }, {} as Record<string, string>);
      });
      setUploadedData(data);
      toast({
        title: "File Processed",
        description: `Found ${data.length} records. Review and confirm import.`,
      });
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!uploadedData) return;

    const newImport: ImportHistory = {
      id: Date.now().toString(),
      filename: "imported_data.csv",
      date: new Date(),
      records: uploadedData.length,
      status: "success",
    };

    setImportHistory([newImport, ...importHistory]);
    setUploadedData(null);

    toast({
      title: "Import Successful!",
      description: `${uploadedData.length} records have been imported.`,
    });
  };

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_health_data.csv";
    a.click();
    toast({ title: "Sample CSV downloaded" });
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Import Health Data</h1>
          <p className="text-muted-foreground">
            Manually enter data or import from your fitness devices
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Manual Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Manual Entry
              </CardTitle>
              <CardDescription>Add health measurements manually</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={(d) => d && setDate(d)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-1">
                    <Footprints className="h-3 w-3" />
                    Steps
                  </Label>
                  <Input
                    type="number"
                    placeholder="8000"
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    className="input-focus"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    Heart Rate (avg)
                  </Label>
                  <Input
                    type="number"
                    placeholder="72"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    className="input-focus"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-1">
                    <Moon className="h-3 w-3" />
                    Sleep (hours)
                  </Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="7.5"
                    value={sleep}
                    onChange={(e) => setSleep(e.target.value)}
                    className="input-focus"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-1">
                    <Scale className="h-3 w-3" />
                    Weight
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="165"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="input-focus"
                  />
                </div>
              </div>

              <Button onClick={handleAddEntry} className="w-full" variant="hero">
                <Plus className="h-4 w-4" />
                Add Entry
              </Button>

              {/* Recent Manual Entries */}
              {manualEntries.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label>Recent Entries</Label>
                  {manualEntries.slice(0, 3).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="text-sm">
                        <p className="font-medium text-foreground">
                          {format(new Date(entry.date), "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.steps > 0 && `${entry.steps} steps • `}
                          {entry.heartRate > 0 && `${entry.heartRate} bpm • `}
                          {entry.sleep > 0 && `${entry.sleep}h sleep`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* CSV Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                CSV Upload
              </CardTitle>
              <CardDescription>Import data from a CSV file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <FileUp className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">
                  Drag & drop your CSV file here
                </p>
                <p className="text-xs text-muted-foreground mb-3">or</p>
                <label>
                  <Input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Button variant="outline" size="sm" asChild>
                    <span>Browse Files</span>
                  </Button>
                </label>
              </div>

              {/* Sample Download */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={handleDownloadSample}
              >
                <Download className="h-4 w-4" />
                Download Sample CSV
              </Button>

              {/* Data Preview */}
              {uploadedData && (
                <div className="space-y-3">
                  <Label>Data Preview</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {Object.keys(uploadedData[0] || {}).map((key) => (
                            <TableHead key={key} className="text-xs">
                              {key}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploadedData.slice(0, 3).map((row, i) => (
                          <TableRow key={i}>
                            {Object.values(row).map((value, j) => (
                              <TableCell key={j} className="text-xs">
                                {value as string}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleConfirmImport} className="flex-1" variant="hero">
                      <Check className="h-4 w-4" />
                      Confirm Import ({uploadedData.length} records)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setUploadedData(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Supported Devices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Supported Devices & Formats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {supportedDevices.map((device) => (
                <div
                  key={device.name}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30"
                >
                  <device.icon className="h-8 w-8 text-primary" />
                  <p className="text-xs font-medium text-center">{device.name}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Export data from your device's app and upload the CSV file here. Most fitness apps support CSV export
              in their settings or data management section.
            </p>
          </CardContent>
        </Card>

        {/* Import History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Import History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {importHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    {item.status === "success" ? (
                      <div className="h-8 w-8 rounded-full bg-health-green/10 flex items-center justify-center">
                        <Check className="h-4 w-4 text-health-green" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(item.date), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{item.records} records</Badge>
                    <Badge
                      className={
                        item.status === "success"
                          ? "bg-health-green/10 text-health-green"
                          : "bg-destructive/10 text-destructive"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
