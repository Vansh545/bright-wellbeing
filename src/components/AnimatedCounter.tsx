import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function AnimatedCounter({ 
  value, 
  duration = 1.5, 
  className,
  suffix = "",
  prefix = "",
}: AnimatedCounterProps) {
  const spring = useSpring(0, { 
    stiffness: 50, 
    damping: 20,
    duration: duration * 1000,
  });
  
  const display = useTransform(spring, (current) => 
    `${prefix}${Math.round(current).toLocaleString()}${suffix}`
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span className={className}>
      {display}
    </motion.span>
  );
}

// Simpler version that works without useTransform bugs
export function CountUp({ 
  end, 
  duration = 2, 
  className,
  suffix = "",
  prefix = "",
}: { 
  end: number; 
  duration?: number; 
  className?: string;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return (
    <span className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}
