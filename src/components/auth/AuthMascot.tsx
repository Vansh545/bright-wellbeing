import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

export type MascotState = 
  | "idle"
  | "wave"
  | "typing"
  | "happy"
  | "sad"
  | "celebration"
  | "thinking";

interface AuthMascotProps {
  state: MascotState;
  className?: string;
}

export function AuthMascot({ state, className = "" }: AuthMascotProps) {
  const mascotAnimation = useMemo(() => {
    switch (state) {
      case "wave":
        return {
          body: { rotate: [0, -5, 5, -5, 0], transition: { duration: 1, repeat: 2 } },
          leftArm: { rotate: [0, -30, 30, -30, 30, 0], transition: { duration: 0.5, repeat: 3 } },
          eyes: { scale: 1 },
          mouth: { d: "M 35 55 Q 50 65 65 55" }, // smile
        };
      case "typing":
        return {
          body: { y: [0, -2, 0], transition: { duration: 0.5, repeat: Infinity } },
          leftArm: { rotate: 0 },
          eyes: { scale: [1, 0.8, 1], transition: { duration: 2, repeat: Infinity } },
          mouth: { d: "M 35 55 Q 50 55 65 55" }, // neutral
        };
      case "happy":
        return {
          body: { y: [0, -8, 0], transition: { duration: 0.4, repeat: 2 } },
          leftArm: { rotate: [0, -20, 0] },
          eyes: { scale: 1.1 },
          mouth: { d: "M 30 52 Q 50 70 70 52" }, // big smile
        };
      case "sad":
        return {
          body: { y: [0, 3, 0], transition: { duration: 1 } },
          leftArm: { rotate: 0 },
          eyes: { y: 3 },
          mouth: { d: "M 35 60 Q 50 50 65 60" }, // frown
        };
      case "celebration":
        return {
          body: { 
            rotate: [0, -10, 10, -10, 10, 0], 
            y: [0, -15, 0, -15, 0],
            transition: { duration: 1, repeat: 2 } 
          },
          leftArm: { rotate: [0, -60, 0, -60, 0], transition: { duration: 0.3, repeat: 5 } },
          eyes: { scale: [1, 1.2, 1], transition: { duration: 0.3, repeat: 5 } },
          mouth: { d: "M 30 50 Q 50 75 70 50" }, // excited
        };
      case "thinking":
        return {
          body: { rotate: [0, 5, 0], transition: { duration: 2, repeat: Infinity } },
          leftArm: { rotate: [0, 10, 0], transition: { duration: 2, repeat: Infinity } },
          eyes: { x: [0, 3, 0], transition: { duration: 2, repeat: Infinity } },
          mouth: { d: "M 40 55 Q 50 55 60 58" }, // pondering
        };
      default: // idle
        return {
          body: { y: [0, -3, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const } },
          leftArm: { rotate: 0 },
          eyes: { scale: [1, 1, 0.1, 1], transition: { duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] } },
          mouth: { d: "M 35 55 Q 50 62 65 55" }, // slight smile
        };
    }
  }, [state]);

  return (
    <div className={`relative ${className}`}>
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
      >
        {/* Shadow */}
        <motion.ellipse
          cx="50"
          cy="90"
          rx="25"
          ry="5"
          fill="hsl(var(--muted))"
          animate={{ 
            rx: state === "celebration" ? [25, 20, 25] : 25,
            opacity: state === "celebration" ? [0.3, 0.5, 0.3] : 0.3 
          }}
        />

        {/* Body */}
        <motion.g animate={mascotAnimation.body}>
          {/* Main body - cute blob shape */}
          <motion.path
            d="M 25 45 
               Q 25 25, 50 20 
               Q 75 25, 75 45 
               Q 78 70, 50 80 
               Q 22 70, 25 45"
            fill="hsl(var(--primary))"
            className="drop-shadow-lg"
          />
          
          {/* Inner glow */}
          <motion.ellipse
            cx="40"
            cy="35"
            rx="15"
            ry="10"
            fill="hsl(var(--primary-foreground))"
            opacity="0.2"
          />

          {/* Left arm */}
          <motion.ellipse
            cx="22"
            cy="50"
            rx="8"
            ry="12"
            fill="hsl(var(--primary))"
            animate={mascotAnimation.leftArm}
            style={{ originX: "30px", originY: "50px" }}
          />

          {/* Right arm */}
          <motion.ellipse
            cx="78"
            cy="50"
            rx="8"
            ry="12"
            fill="hsl(var(--primary))"
          />

          {/* Face */}
          <g>
            {/* Left eye */}
            <motion.g animate={mascotAnimation.eyes}>
              <ellipse cx="38" cy="42" rx="8" ry="9" fill="white" />
              <motion.circle 
                cx="40" 
                cy="43" 
                r="4" 
                fill="hsl(var(--foreground))"
                animate={state === "sad" ? { cy: 45 } : { cy: 43 }}
              />
              <circle cx="42" cy="41" r="1.5" fill="white" />
            </motion.g>

            {/* Right eye */}
            <motion.g animate={mascotAnimation.eyes}>
              <ellipse cx="62" cy="42" rx="8" ry="9" fill="white" />
              <motion.circle 
                cx="64" 
                cy="43" 
                r="4" 
                fill="hsl(var(--foreground))"
                animate={state === "sad" ? { cy: 45 } : { cy: 43 }}
              />
              <circle cx="66" cy="41" r="1.5" fill="white" />
            </motion.g>

            {/* Cheeks */}
            <AnimatePresence>
              {(state === "happy" || state === "celebration") && (
                <>
                  <motion.circle
                    cx="28"
                    cy="52"
                    r="5"
                    fill="hsl(var(--health-coral))"
                    opacity="0.5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  />
                  <motion.circle
                    cx="72"
                    cy="52"
                    r="5"
                    fill="hsl(var(--health-coral))"
                    opacity="0.5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  />
                </>
              )}
            </AnimatePresence>

            {/* Mouth */}
            <motion.path
              d={mascotAnimation.mouth.d}
              stroke="hsl(var(--foreground))"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              initial={false}
              animate={{ d: mascotAnimation.mouth.d }}
              transition={{ duration: 0.3 }}
            />

            {/* Sweat drop for sad state */}
            <AnimatePresence>
              {state === "sad" && (
                <motion.path
                  d="M 75 35 Q 78 40 75 45 Q 72 40 75 35"
                  fill="hsl(var(--health-teal))"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                />
              )}
            </AnimatePresence>

            {/* Sparkles for celebration */}
            <AnimatePresence>
              {state === "celebration" && (
                <>
                  <motion.circle
                    cx="15"
                    cy="25"
                    r="3"
                    fill="hsl(var(--health-mint))"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.circle
                    cx="85"
                    cy="20"
                    r="2.5"
                    fill="hsl(var(--health-coral))"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.circle
                    cx="90"
                    cy="40"
                    r="2"
                    fill="hsl(var(--health-teal))"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                  <motion.circle
                    cx="10"
                    cy="55"
                    r="2"
                    fill="hsl(var(--primary))"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                  />
                </>
              )}
            </AnimatePresence>
          </g>
        </motion.g>
      </motion.svg>
    </div>
  );
}
