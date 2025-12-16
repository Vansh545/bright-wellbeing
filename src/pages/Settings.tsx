import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Download,
  Trash2,
  Moon,
  Sun,
  HelpCircle,
  Info,
  Key,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    skincareReminders: true,
    weeklyReport: true,
    aiInsights: true,
    appUpdates: false,
  });
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "",
  });

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
    toast({
      title: `${isDarkMode ? "Light" : "Dark"} mode enabled`,
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data is being prepared for download.",
    });
  };

  const handleClearHistory = (type: string) => {
    toast({
      title: `${type} cleared`,
      description: `Your ${type.toLowerCase()} has been cleared.`,
    });
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">JD</span>
              </div>
              <div>
                <Button variant="outline" size="sm">
                  Change Photo
                </Button>
              </div>
            </div>
            <Separator />
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="input-focus"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="input-focus"
                />
              </div>
              <div>
                <Label>Phone (optional)</Label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="input-focus"
                />
              </div>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isDarkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
              Appearance
            </CardTitle>
            <CardDescription>Customize how the app looks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-medium text-foreground">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Toggle dark theme</p>
                </div>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={handleToggleDarkMode} />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>Choose what notifications you receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "workoutReminders", label: "Workout Reminders", description: "Get reminded to complete your daily workout" },
              { key: "skincareReminders", label: "Skincare Reminders", description: "Never miss your skincare routine" },
              { key: "weeklyReport", label: "Weekly Progress Report", description: "Receive a summary of your weekly activity" },
              { key: "aiInsights", label: "AI Insights", description: "Get personalized health tips and recommendations" },
              { key: "appUpdates", label: "App Updates", description: "Be notified about new features and updates" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch
                  checked={notifications[item.key as keyof typeof notifications]}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, [item.key]: checked })
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Data Management
            </CardTitle>
            <CardDescription>Export your data or clear history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Export All Data</p>
                  <p className="text-sm text-muted-foreground">Download all your health data</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleExportData}>
                Export
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Clear History</p>
              <div className="grid sm:grid-cols-3 gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      Workout History
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear Workout History?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your workout records. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleClearHistory("Workout history")}>
                        Clear
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      Skincare History
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear Skincare History?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your skincare records. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleClearHistory("Skincare history")}>
                        Clear
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      Chat History
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear Chat History?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your AI chat conversations. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleClearHistory("Chat history")}>
                        Clear
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <Separator />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and all associated data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Privacy & API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Privacy & API
            </CardTitle>
            <CardDescription>Advanced settings for developers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-foreground">API Key</p>
                <Button variant="outline" size="sm">
                  Generate New Key
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Use this key to integrate with external apps and services.
              </p>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-foreground">Analytics</p>
                <p className="text-sm text-muted-foreground">Help improve the app with anonymous usage data</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">App Version</p>
              <p className="text-sm font-medium">1.0.0</p>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4" />
                Help & Support
              </Button>
              <Button variant="outline" size="sm">
                Privacy Policy
              </Button>
              <Button variant="outline" size="sm">
                Terms of Service
              </Button>
            </div>
            <Separator />
            <Button variant="ghost" className="w-full text-destructive hover:text-destructive">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
