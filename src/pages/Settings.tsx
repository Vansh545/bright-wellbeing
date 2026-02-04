import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Download,
  Trash2,
  Moon,
  Sun,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Check,
  Camera,
  Loader2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { ApiKeySettings } from "@/components/settings/ApiKeySettings";
import { AuthProviderSettings } from "@/components/settings/AuthProviderSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function Settings() {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.user_metadata?.full_name || user.user_metadata?.name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
      });
      setAvatarUrl(user.user_metadata?.avatar_url || null);
    }
  }, [user]);

  // Get user initials
  const getInitials = () => {
    if (profileForm.name) {
      return profileForm.name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (profileForm.email) {
      return profileForm.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create a data URL for immediate preview
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        setAvatarUrl(dataUrl);

        // Update user metadata with the new avatar
        const { error } = await supabase.auth.updateUser({
          data: { 
            avatar_url: dataUrl,
            updated_at: new Date().toISOString(),
          }
        });

        if (error) {
          toast({
            title: "Upload failed",
            description: "Could not update your profile photo.",
            variant: "destructive",
          });
          setAvatarUrl(user.user_metadata?.avatar_url || null);
        } else {
          toast({
            title: "Photo updated",
            description: "Your profile photo has been updated.",
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: profileForm.name,
          phone: profileForm.phone,
        }
      });

      if (error) {
        toast({
          title: "Save failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setSaveSuccess(true);
      toast({
        title: "Changes saved",
        description: "Your profile has been updated successfully.",
      });
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      toast({
        title: "Save failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  return (
    <AppLayout>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <motion.h1 
            className="text-2xl font-bold text-foreground"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Settings
          </motion.h1>
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Manage your account and preferences
          </motion.p>
        </motion.div>

        {/* Profile Section */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                  <User className="h-5 w-5 text-primary" />
                </motion.div>
                Profile
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div 
                className="flex items-center gap-4"
                whileHover={{ scale: 1.01 }}
              >
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={avatarUrl || undefined} alt={profileForm.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {isUploading ? "Uploading..." : "Change Photo"}
                    </Button>
                  </motion.div>
                  <p className="text-xs text-muted-foreground">JPG, PNG. Max 5MB.</p>
                </div>
              </motion.div>
              <Separator />
              <div className="grid sm:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Label>Full Name</Label>
                  <Input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Enter your name"
                    className="input-focus"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="input-focus bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Label>Phone (optional)</Label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="input-focus"
                  />
                </motion.div>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={handleSave} className="relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    {saveSuccess ? (
                      <motion.span
                        key="success"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Saved!
                      </motion.span>
                    ) : (
                      <motion.span
                        key="save"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        Save Changes
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: isDarkMode ? 180 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {isDarkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                </motion.div>
                Appearance
              </CardTitle>
              <CardDescription>Customize how the app looks</CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={isDarkMode ? "moon" : "sun"}
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                      >
                        {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                  <div>
                    <p className="font-medium text-foreground">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Toggle dark theme</p>
                  </div>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={handleToggleDarkMode} />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Smart Notifications */}
        <motion.div variants={itemVariants}>
          <NotificationSettings />
        </motion.div>

        {/* Data Management */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Data Management
              </CardTitle>
              <CardDescription>Export your data or clear history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div 
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div whileHover={{ rotate: 10 }}>
                    <Download className="h-5 w-5 text-primary" />
                  </motion.div>
                  <div>
                    <p className="font-medium text-foreground">Export All Data</p>
                    <p className="text-sm text-muted-foreground">Download all your health data</p>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.05, x: 5 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" onClick={handleExportData}>
                    Export
                    <motion.div
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                  </Button>
                </motion.div>
              </motion.div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Clear History</p>
                <div className="grid sm:grid-cols-3 gap-2">
                  {["Workout History", "Skincare History", "Chat History"].map((type, index) => (
                    <AlertDialog key={type}>
                      <AlertDialogTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button variant="outline" size="sm" className="w-full">
                            {type}
                          </Button>
                        </motion.div>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Clear {type}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete all your {type.toLowerCase()} records. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleClearHistory(type)}>
                            Clear
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ))}
                </div>
              </div>

              <Separator />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </motion.div>
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
        </motion.div>

        {/* Authentication Providers Section */}
        <motion.div variants={itemVariants}>
          <AuthProviderSettings />
        </motion.div>

        {/* API Integrations Section */}
        <motion.div variants={itemVariants}>
          <ApiKeySettings />
        </motion.div>

        {/* About */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Info className="h-5 w-5 text-primary" />
                </motion.div>
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">App Version</p>
                <motion.p 
                  className="text-sm font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  1.0.0
                </motion.p>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-2">
                {["Help & Support", "Privacy Policy", "Terms of Service"].map((label, index) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" size="sm">
                      {label === "Help & Support" && <HelpCircle className="h-4 w-4" />}
                      {label}
                    </Button>
                  </motion.div>
                ))}
              </div>
              <Separator />
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button 
                  variant="ghost" 
                  className="w-full text-destructive hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
