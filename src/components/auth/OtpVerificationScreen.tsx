import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, RefreshCw, CheckCircle, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BearMascot, type BearState } from "./BearMascot";

interface OtpVerificationScreenProps {
  email: string;
  password: string;
  onVerified: () => void;
  onBack: () => void;
}

export function OtpVerificationScreen({ 
  email, 
  password, 
  onVerified, 
  onBack 
}: OtpVerificationScreenProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [mascotState, setMascotState] = useState<BearState>("wave");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  // Countdown for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);
    setMascotState("typing");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === 5 && newOtp.every(d => d)) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (otpCode: string) => {
    setIsVerifying(true);
    setMascotState("thinking");
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("verify-otp", {
        body: { email, otp: otpCode, password },
      });

      if (fnError || data?.error) {
        setError(data?.error || "Verification failed. Please try again.");
        setMascotState("sad");
        setTimeout(() => setMascotState("idle"), 2000);
        return;
      }

      setMascotState("celebration");
      toast({
        title: "Account Verified!",
        description: "Your account has been created successfully.",
      });

      // Sign in the user after successful verification
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Auto sign-in failed:", signInError);
        // Still consider it a success - user can sign in manually
      }

      setTimeout(onVerified, 1500);
    } catch (err) {
      console.error("Verification error:", err);
      setError("An unexpected error occurred. Please try again.");
      setMascotState("sad");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setMascotState("thinking");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("send-otp", {
        body: { email },
      });

      if (fnError || data?.error) {
        toast({
          title: "Failed to resend",
          description: data?.error || "Please wait a moment and try again.",
          variant: "destructive",
        });
        setMascotState("sad");
        return;
      }

      setOtp(["", "", "", "", "", ""]);
      setResendCooldown(60);
      setMascotState("happy");
      toast({
        title: "Code sent!",
        description: "Check your email for the new verification code.",
      });
    } catch (err) {
      toast({
        title: "Failed to resend",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      setMascotState("sad");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header with mascot */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="flex justify-center mb-4"
        >
          <BearMascot state={mascotState} className="w-24 h-24" />
        </motion.div>
        
        <motion.div
          className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 mb-4"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Mail className="h-7 w-7 text-primary" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-foreground">Verify your email</h2>
        <p className="text-muted-foreground mt-2">
          We've sent a 6-digit code to
        </p>
        <p className="font-medium text-foreground">{email}</p>
      </div>

      {/* OTP Input */}
      <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Input
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 text-center text-xl font-bold ${
                error ? "border-destructive ring-2 ring-destructive/20" : ""
              } ${digit ? "border-primary ring-2 ring-primary/20" : ""}`}
              disabled={isVerifying}
            />
          </motion.div>
        ))}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-center text-sm text-destructive mb-4"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Verify button */}
      <Button
        onClick={() => handleVerify(otp.join(""))}
        disabled={otp.some(d => !d) || isVerifying}
        className="w-full mb-4"
        size="lg"
      >
        {isVerifying ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Verify Email
          </span>
        )}
      </Button>

      {/* Resend and back buttons */}
      <div className="flex flex-col items-center gap-3">
        <Button
          variant="ghost"
          onClick={handleResend}
          disabled={isResending || resendCooldown > 0}
          className="text-sm"
        >
          {isResending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {resendCooldown > 0 
            ? `Resend code in ${resendCooldown}s` 
            : "Resend verification code"}
        </Button>

        <Button
          variant="link"
          onClick={onBack}
          className="text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to sign up
        </Button>
      </div>

      {/* Help text */}
      <p className="text-center text-xs text-muted-foreground mt-6">
        Didn't receive the code? Check your spam folder or try a different email address.
      </p>
    </motion.div>
  );
}
