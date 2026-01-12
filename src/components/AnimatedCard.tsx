import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glowEffect?: boolean;
  delay?: number;
}

export function AnimatedCard({
  children,
  className,
  hoverEffect = true,
  glowEffect = false,
  delay = 0,
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay,
      }}
      whileHover={hoverEffect ? { 
        y: -5, 
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 17 }
      } : undefined}
      whileTap={hoverEffect ? { scale: 0.98 } : undefined}
      {...props}
    >
      <Card className={cn(
        "transition-shadow duration-300",
        hoverEffect && "hover:shadow-xl hover:shadow-primary/5",
        glowEffect && "shadow-glow",
        className
      )}>
        {children}
      </Card>
    </motion.div>
  );
}
