import { motion } from "framer-motion";
import { Shield, ExternalLink, CheckCircle, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function AuthProviderSettings() {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
            <Shield className="h-5 w-5 text-primary" />
          </motion.div>
          Authentication Providers
        </CardTitle>
        <CardDescription>
          Manage sign-in methods and security settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email/Password */}
        <motion.div
          className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 7l-10 6L2 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-foreground">Email & Password</p>
              <p className="text-sm text-muted-foreground">Traditional email login with password</p>
            </div>
          </div>
          <Badge variant="default" className="bg-health-mint text-health-mint-foreground">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </motion.div>

        {/* Google OAuth */}
        <motion.div
          className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white border flex items-center justify-center">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-foreground">Google</p>
              <p className="text-sm text-muted-foreground">Sign in with Google account</p>
            </div>
          </div>
          <Badge variant="default" className="bg-health-mint text-health-mint-foreground">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </motion.div>

        <Separator />

        {/* Info about custom credentials */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Using Managed Authentication</p>
            <p className="text-xs text-muted-foreground">
              Your authentication is managed securely by Lovable Cloud. 
              For custom branding or enterprise requirements, you can configure your own OAuth credentials in the backend dashboard.
            </p>
            <Button variant="outline" size="sm" className="mt-2 gap-2">
              <ExternalLink className="h-3 w-3" />
              View Backend Settings
            </Button>
          </div>
        </div>

        {/* Security Features */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Security Features</h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Email Verification", status: "Enabled" },
              { label: "Strong Passwords", status: "Required" },
              { label: "Password Reset", status: "Available" },
              { label: "Session Management", status: "Active" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/30"
              >
                <CheckCircle className="h-4 w-4 text-health-mint" />
                <div>
                  <p className="text-xs font-medium text-foreground">{feature.label}</p>
                  <p className="text-xs text-muted-foreground">{feature.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
