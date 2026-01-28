import { motion } from "framer-motion";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailVerificationBannerProps {
  email: string;
}

export function EmailVerificationBanner({ email }: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);
  const { toast } = useToast();

  const handleResend = async () => {
    setIsResending(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        toast({
          title: "Failed to resend",
          description: "Please wait a moment and try again.",
          variant: "destructive",
        });
      } else {
        setResent(true);
        toast({
          title: "Email sent",
          description: "Check your inbox for the verification link.",
        });
        setTimeout(() => setResent(false), 30000);
      }
    } catch {
      toast({
        title: "Failed to resend",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="relative overflow-hidden rounded-xl border border-health-teal/30 bg-health-teal/10 backdrop-blur-sm p-6">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-health-teal/5 via-health-mint/10 to-health-teal/5"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        <div className="relative space-y-4">
          <div className="flex items-start gap-4">
            <motion.div
              className="h-12 w-12 rounded-full bg-health-teal/20 flex items-center justify-center shrink-0"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Mail className="h-6 w-6 text-health-teal" />
            </motion.div>
            
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">Verify your email</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a verification link to{" "}
                <strong className="text-foreground">{email}</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Please check your inbox and click the link to activate your account.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResend}
              disabled={isResending || resent}
              className="gap-2"
            >
              {isResending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : resent ? (
                <CheckCircle className="h-4 w-4 text-health-mint" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {resent ? "Email Sent" : "Resend Email"}
            </Button>
            
            <span className="text-xs text-muted-foreground">
              Didn't receive it? Check your spam folder
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
