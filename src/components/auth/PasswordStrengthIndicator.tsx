import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useMemo } from "react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const requirements: PasswordRequirement[] = useMemo(() => [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains number", met: /\d/.test(password) },
    { label: "Contains special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ], [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter((r) => r.met).length;
    if (metCount === 0) return { level: 0, label: "", color: "" };
    if (metCount <= 2) return { level: 1, label: "Weak", color: "bg-destructive" };
    if (metCount <= 3) return { level: 2, label: "Fair", color: "bg-yellow-500" };
    if (metCount <= 4) return { level: 3, label: "Good", color: "bg-health-teal" };
    return { level: 4, label: "Strong", color: "bg-health-mint" };
  }, [requirements]);

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-3 pt-2"
    >
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <motion.span
            key={strength.label}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`font-medium ${
              strength.level <= 1 ? "text-destructive" :
              strength.level === 2 ? "text-yellow-500" :
              "text-health-teal"
            }`}
          >
            {strength.label}
          </motion.span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${strength.color} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${(strength.level / 4) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Requirements List */}
      <div className="grid grid-cols-1 gap-1.5">
        {requirements.map((req, index) => (
          <motion.div
            key={req.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2 text-xs"
          >
            <motion.div
              initial={false}
              animate={{
                scale: req.met ? [1, 1.2, 1] : 1,
                backgroundColor: req.met ? "hsl(var(--health-mint))" : "hsl(var(--muted))",
              }}
              className="h-4 w-4 rounded-full flex items-center justify-center"
            >
              {req.met ? (
                <Check className="h-2.5 w-2.5 text-white" />
              ) : (
                <X className="h-2.5 w-2.5 text-muted-foreground" />
              )}
            </motion.div>
            <span className={req.met ? "text-foreground" : "text-muted-foreground"}>
              {req.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function validatePasswordStrength(password: string): { isValid: boolean; message: string } {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters" };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain an uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain a lowercase letter" };
  }
  if (!/\d/.test(password)) {
    return { isValid: false, message: "Password must contain a number" };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: "Password must contain a special character" };
  }
  return { isValid: true, message: "" };
}
