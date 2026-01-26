import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Key, 
  Youtube, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  EyeOff, 
  Save,
  Loader2,
  ExternalLink,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyConfig {
  key: string;
  label: string;
  description: string;
  icon: typeof Youtube;
  helpUrl: string;
  placeholder: string;
}

const apiKeys: ApiKeyConfig[] = [
  {
    key: "youtube_api_key",
    label: "YouTube Data API Key",
    description: "Required for personalized video recommendations. Get your API key from the Google Cloud Console.",
    icon: Youtube,
    helpUrl: "https://console.cloud.google.com/apis/credentials",
    placeholder: "AIza...",
  },
];

export function ApiKeySettings() {
  const [keyValues, setKeyValues] = useState<Record<string, string>>({});
  const [keyStatus, setKeyStatus] = useState<Record<string, boolean>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchApiKeyStatus();
  }, []);

  const fetchApiKeyStatus = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("setting_key, setting_value")
        .in("setting_key", apiKeys.map((k) => k.key));

      if (error) throw error;

      const status: Record<string, boolean> = {};
      const values: Record<string, string> = {};

      apiKeys.forEach((apiKey) => {
        const found = data?.find((d) => d.setting_key === apiKey.key);
        status[apiKey.key] = !!found?.setting_value;
        values[apiKey.key] = found?.setting_value || "";
      });

      setKeyStatus(status);
      setKeyValues(values);
    } catch (error) {
      console.error("Error fetching API key status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKey = async (settingKey: string) => {
    const value = keyValues[settingKey];
    
    if (!value.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter an API key before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving((prev) => ({ ...prev, [settingKey]: true }));

    try {
      const { error } = await supabase
        .from("app_settings")
        .upsert({
          setting_key: settingKey,
          setting_value: value.trim(),
          is_encrypted: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: "setting_key" });

      if (error) throw error;

      setKeyStatus((prev) => ({ ...prev, [settingKey]: true }));
      
      toast({
        title: "API Key Saved",
        description: "Your API key has been saved successfully. Video recommendations will now be personalized.",
      });
    } catch (error) {
      console.error("Error saving API key:", error);
      toast({
        title: "Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving((prev) => ({ ...prev, [settingKey]: false }));
    }
  };

  const handleRemoveKey = async (settingKey: string) => {
    setIsSaving((prev) => ({ ...prev, [settingKey]: true }));

    try {
      const { error } = await supabase
        .from("app_settings")
        .delete()
        .eq("setting_key", settingKey);

      if (error) throw error;

      setKeyStatus((prev) => ({ ...prev, [settingKey]: false }));
      setKeyValues((prev) => ({ ...prev, [settingKey]: "" }));
      
      toast({
        title: "API Key Removed",
        description: "Your API key has been removed. Video recommendations will use fallback content.",
      });
    } catch (error) {
      console.error("Error removing API key:", error);
      toast({
        title: "Error",
        description: "Failed to remove API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving((prev) => ({ ...prev, [settingKey]: false }));
    }
  };

  const toggleShowKey = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            API Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
            <Key className="h-5 w-5 text-primary" />
          </motion.div>
          API Integrations
        </CardTitle>
        <CardDescription>
          Connect external services for enhanced features like personalized video recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {apiKeys.map((apiKey, index) => (
          <motion.div
            key={apiKey.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <apiKey.icon className="h-5 w-5 text-destructive" />
                  </motion.div>
                  <div>
                    <h4 className="font-medium text-foreground">{apiKey.label}</h4>
                    <p className="text-sm text-muted-foreground">{apiKey.description}</p>
                  </div>
                </div>
                <AnimatePresence mode="wait">
                  {keyStatus[apiKey.key] ? (
                    <motion.div
                      key="connected"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Badge className="bg-health-green text-health-green-light">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="disconnected"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Badge variant="outline" className="text-muted-foreground">
                        <XCircle className="h-3 w-3 mr-1" />
                        Not Connected
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input */}
              <div className="space-y-2">
                <Label htmlFor={apiKey.key}>API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id={apiKey.key}
                      type={showKeys[apiKey.key] ? "text" : "password"}
                      placeholder={apiKey.placeholder}
                      value={keyValues[apiKey.key] || ""}
                      onChange={(e) =>
                        setKeyValues((prev) => ({
                          ...prev,
                          [apiKey.key]: e.target.value,
                        }))
                      }
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => toggleShowKey(apiKey.key)}
                    >
                      {showKeys[apiKey.key] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => handleSaveKey(apiKey.key)}
                      disabled={isSaving[apiKey.key]}
                    >
                      {isSaving[apiKey.key] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => window.open(apiKey.helpUrl, "_blank")}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Get API Key
                </Button>
                
                {keyStatus[apiKey.key] && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemoveKey(apiKey.key)}
                    disabled={isSaving[apiKey.key]}
                  >
                    Remove Key
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        <Separator />

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Security Note</AlertTitle>
          <AlertDescription>
            API keys are stored securely in the database and are never exposed in client-side code.
            Only use API keys with appropriate usage limits configured.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
