import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

// Auth Components
import { AuthMascot, type MascotState } from "@/components/auth/AuthMascot";
import { PasswordStrengthIndicator, validatePasswordStrength } from "@/components/auth/PasswordStrengthIndicator";
import { ForgotPasswordDialog } from "@/components/auth/ForgotPasswordDialog";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";

const emailSchema = z.string().email("Please enter a valid email address");

// Floating orb component
const FloatingOrb = ({ delay, size, color, position }: { delay: number; size: string; color: string; position: string }) => (
  <motion.div
    className={`absolute ${size} ${color} rounded-full blur-3xl opacity-30 ${position}`}
    animate={{
      y: [0, -30, 0],
      x: [0, 15, 0],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [mascotState, setMascotState] = useState<MascotState>("wave");
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [showVerificationBanner, setShowVerificationBanner] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Check for password reset redirect
  useEffect(() => {
    if (searchParams.get("reset") === "true") {
      toast({
        title: "Password Reset",
        description: "Please enter your new password below.",
      });
    }
  }, [searchParams, toast]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  // Update mascot state based on mode
  useEffect(() => {
    if (!isLoading && !isTyping) {
      setMascotState(isLogin ? "wave" : "wave");
    }
  }, [isLogin, isLoading, isTyping]);

  // Typing timeout for mascot
  useEffect(() => {
    if (isTyping) {
      const timeout = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [isTyping]);

  const handleInputChange = useCallback((field: "email" | "password", value: string) => {
    if (field === "email") {
      setEmail(value);
      if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
    } else {
      setPassword(value);
      if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
    }
    setIsTyping(true);
    setMascotState("typing");
  }, [errors]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    // Validate email
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    // Validate password
    if (!isLogin) {
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message;
      }
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      setMascotState("sad");
      setTimeout(() => setMascotState("idle"), 2000);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setMascotState("thinking");

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        let errorMessage = error.message;
        
        // Handle common error cases with friendly messages
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please try again.";
          setMascotState("sad");
        } else if (error.message.includes("User already registered")) {
          errorMessage = "An account with this email already exists. Please sign in instead.";
          setMascotState("sad");
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please check your email to confirm your account.";
          setShowVerificationBanner(true);
          setVerificationEmail(email);
          setMascotState("thinking");
        } else {
          setMascotState("sad");
        }

        toast({
          title: isLogin ? "Sign In Failed" : "Sign Up Failed",
          description: errorMessage,
          variant: "destructive",
        });
        
        setTimeout(() => setMascotState("idle"), 3000);
        return;
      }

      if (!isLogin) {
        // Show verification banner for new signups
        setShowVerificationBanner(true);
        setVerificationEmail(email);
        setMascotState("celebration");
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
        });
      } else {
        setMascotState("celebration");
        toast({
          title: "Welcome Back!",
          description: "You've successfully signed in.",
        });
        setTimeout(() => navigate("/", { replace: true }), 500);
      }
    } catch (error) {
      setMascotState("sad");
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setTimeout(() => setMascotState("idle"), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-10 w-10 text-primary" />
        </motion.div>
      </div>
    );
  }

  // Show verification banner if needed
  if (showVerificationBanner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex flex-col items-center justify-center p-4 overflow-hidden relative">
        <FloatingOrb delay={0} size="w-96 h-96" color="bg-primary" position="top-0 left-0 -translate-x-1/2 -translate-y-1/2" />
        <FloatingOrb delay={2} size="w-80 h-80" color="bg-health-teal" position="bottom-0 right-0 translate-x-1/3 translate-y-1/3" />
        
        <motion.div 
          className="mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <AuthMascot state="celebration" className="w-24 h-24" />
        </motion.div>
        
        <EmailVerificationBanner email={verificationEmail} />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Button
            variant="ghost"
            onClick={() => {
              setShowVerificationBanner(false);
              setIsLogin(true);
              setMascotState("wave");
            }}
          >
            Back to Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background orbs */}
      <FloatingOrb delay={0} size="w-96 h-96" color="bg-primary" position="top-0 left-0 -translate-x-1/2 -translate-y-1/2" />
      <FloatingOrb delay={2} size="w-80 h-80" color="bg-health-teal" position="bottom-0 right-0 translate-x-1/3 translate-y-1/3" />
      <FloatingOrb delay={4} size="w-64 h-64" color="bg-health-purple" position="top-1/2 right-0 translate-x-1/2" />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo section with mascot */}
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <motion.div 
              className="inline-flex items-center justify-center h-14 w-14 rounded-2xl gradient-bg shadow-glow"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(var(--primary), 0.3)",
                  "0 0 40px rgba(var(--primary), 0.5)",
                  "0 0 20px rgba(var(--primary), 0.3)",
                ],
              }}
              transition={{
                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <Heart className="h-7 w-7 text-primary-foreground" />
            </motion.div>
            
            {/* Mascot */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <AuthMascot state={mascotState} className="w-16 h-16" />
            </motion.div>
          </div>
          
          <motion.h1 
            className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Health Hub
          </motion.h1>
          <motion.p 
            className="text-muted-foreground mt-1 flex items-center justify-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Sparkles className="h-4 w-4" />
            Your personal wellness companion
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="backdrop-blur-xl bg-card/80 border-border/50 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? "login" : "signup"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardTitle className="text-2xl">{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
                  <CardDescription className="mt-2">
                    {isLogin 
                      ? "Sign in to access your personalized health dashboard" 
                      : "Join Health Hub to start your wellness journey"}
                  </CardDescription>
                </motion.div>
              </AnimatePresence>
            </CardHeader>
            <CardContent className="pt-4">
              {/* Google Sign In */}
              <div className="space-y-4">
                <GoogleAuthButton mode={isLogin ? "login" : "signup"} disabled={isLoading} />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Label htmlFor="email">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`pl-10 transition-all duration-300 ${errors.email ? 'border-destructive ring-2 ring-destructive/20' : 'focus:ring-2 focus:ring-primary/20'}`}
                      disabled={isLoading}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-destructive flex items-center gap-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {isLogin && (
                      <motion.button
                        type="button"
                        onClick={() => setForgotPasswordOpen(true)}
                        className="text-xs text-primary hover:underline font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Forgot password?
                      </motion.button>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={`pl-10 pr-10 transition-all duration-300 ${errors.password ? 'border-destructive ring-2 ring-destructive/20' : 'focus:ring-2 focus:ring-primary/20'}`}
                      disabled={isLoading}
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </motion.button>
                  </div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-destructive flex items-center gap-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  
                  {/* Password strength indicator for signup */}
                  <AnimatePresence>
                    {!isLogin && password && (
                      <PasswordStrengthIndicator password={password} />
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full relative overflow-hidden group" 
                    variant="hero"
                    size="lg"
                    disabled={isLoading}
                  >
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      animate={isLoading ? {} : { x: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                    />
                    {isLoading ? (
                      <motion.span 
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isLogin ? "Signing in..." : "Creating account..."}
                      </motion.span>
                    ) : (
                      <span className="relative z-10">
                        {isLogin ? "Sign In" : "Create Account"}
                      </span>
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.div 
                className="mt-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <p className="text-sm text-muted-foreground">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <motion.button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setErrors({});
                      setPassword("");
                      setMascotState("wave");
                    }}
                    className="text-primary hover:underline font-semibold relative"
                    disabled={isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </motion.button>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/30"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog 
        open={forgotPasswordOpen} 
        onOpenChange={setForgotPasswordOpen} 
      />
    </div>
  );
}
