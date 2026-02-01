import { motion } from "framer-motion";

export type BearState = "idle" | "wave" | "typing" | "thinking" | "happy" | "sad" | "celebration";

interface BearMascotProps {
  state: BearState;
  className?: string;
}

export function BearMascot({ state, className = "" }: BearMascotProps) {
  // Animation variants for different states
  const bodyAnimation = {
    idle: { y: 0 },
    wave: { y: [0, -2, 0] },
    typing: { y: [0, -1, 0] },
    thinking: { rotate: [0, -5, 5, 0] },
    happy: { scale: [1, 1.05, 1] },
    sad: { y: [0, 2, 0] },
    celebration: { y: [0, -8, 0], rotate: [0, -5, 5, 0] },
  };

  const pawAnimation = {
    idle: { rotate: 0 },
    wave: { rotate: [0, 20, -10, 20, 0] },
    typing: { y: [0, 2, 0] },
    thinking: { rotate: 0 },
    happy: { rotate: [0, 10, -10, 0] },
    sad: { rotate: 0 },
    celebration: { rotate: [0, 30, -20, 30, 0] },
  };

  const eyeAnimation = {
    idle: { scaleY: 1 },
    wave: { scaleY: [1, 0.2, 1] },
    typing: { scaleY: 1 },
    thinking: { scaleY: [1, 0.8, 1] },
    happy: { scaleY: [1, 0.1, 1] },
    sad: { scaleY: 0.7 },
    celebration: { scaleY: [1, 0.1, 1, 0.1, 1] },
  };

  const mouthVariants = {
    idle: "M 45 62 Q 50 65 55 62",
    wave: "M 45 62 Q 50 68 55 62",
    typing: "M 45 62 Q 50 65 55 62",
    thinking: "M 45 62 Q 50 60 55 62",
    happy: "M 43 60 Q 50 70 57 60",
    sad: "M 45 66 Q 50 62 55 66",
    celebration: "M 42 58 Q 50 72 58 58",
  };

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={className}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        ...bodyAnimation[state]
      }}
      transition={{ 
        duration: state === "celebration" ? 0.4 : 0.6, 
        repeat: state === "celebration" ? 2 : state === "wave" ? 1 : 0,
        ease: "easeInOut"
      }}
    >
      {/* Bear ears */}
      <motion.ellipse
        cx="25"
        cy="22"
        rx="12"
        ry="11"
        fill="#8B5A2B"
        stroke="#6B4423"
        strokeWidth="1.5"
      />
      <ellipse cx="25" cy="22" rx="6" ry="6" fill="#D2B48C" />
      
      <motion.ellipse
        cx="75"
        cy="22"
        rx="12"
        ry="11"
        fill="#8B5A2B"
        stroke="#6B4423"
        strokeWidth="1.5"
      />
      <ellipse cx="75" cy="22" rx="6" ry="6" fill="#D2B48C" />

      {/* Bear head */}
      <motion.ellipse
        cx="50"
        cy="48"
        rx="38"
        ry="35"
        fill="#8B5A2B"
        stroke="#6B4423"
        strokeWidth="2"
      />

      {/* Bear muzzle */}
      <ellipse cx="50" cy="58" rx="18" ry="14" fill="#D2B48C" />

      {/* Eyes */}
      <motion.ellipse
        cx="35"
        cy="42"
        rx="5"
        ry="6"
        fill="#2C1810"
        animate={eyeAnimation[state]}
        transition={{ duration: 0.3, repeat: state === "wave" || state === "happy" || state === "celebration" ? 1 : 0 }}
      />
      <ellipse cx="36" cy="40" rx="2" ry="2" fill="white" opacity="0.8" />
      
      <motion.ellipse
        cx="65"
        cy="42"
        rx="5"
        ry="6"
        fill="#2C1810"
        animate={eyeAnimation[state]}
        transition={{ duration: 0.3, repeat: state === "wave" || state === "happy" || state === "celebration" ? 1 : 0 }}
      />
      <ellipse cx="66" cy="40" rx="2" ry="2" fill="white" opacity="0.8" />

      {/* Eyebrows for expressions */}
      {state === "sad" && (
        <>
          <motion.line
            x1="28"
            y1="34"
            x2="38"
            y2="36"
            stroke="#2C1810"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          <motion.line
            x1="72"
            y1="34"
            x2="62"
            y2="36"
            stroke="#2C1810"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        </>
      )}

      {/* Nose */}
      <ellipse cx="50" cy="54" rx="6" ry="4" fill="#2C1810" />
      <ellipse cx="51" cy="53" rx="2" ry="1.5" fill="white" opacity="0.3" />

      {/* Mouth */}
      <motion.path
        d={mouthVariants[state]}
        fill="none"
        stroke="#2C1810"
        strokeWidth="2"
        strokeLinecap="round"
        initial={false}
        animate={{ d: mouthVariants[state] }}
        transition={{ duration: 0.3 }}
      />

      {/* Cheeks (blush) */}
      {(state === "happy" || state === "celebration" || state === "wave") && (
        <>
          <motion.ellipse
            cx="22"
            cy="52"
            rx="6"
            ry="4"
            fill="#FFB6C1"
            opacity="0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
          />
          <motion.ellipse
            cx="78"
            cy="52"
            rx="6"
            ry="4"
            fill="#FFB6C1"
            opacity="0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
          />
        </>
      )}

      {/* Waving paw (only visible during wave/celebration) */}
      {(state === "wave" || state === "celebration") && (
        <motion.g
          initial={{ rotate: 0, x: 0, y: 0 }}
          animate={pawAnimation[state]}
          transition={{ duration: 0.5, repeat: 2, ease: "easeInOut" }}
          style={{ transformOrigin: "85px 70px" }}
        >
          <ellipse cx="90" cy="65" rx="10" ry="8" fill="#8B5A2B" stroke="#6B4423" strokeWidth="1.5" />
          <ellipse cx="90" cy="65" rx="5" ry="4" fill="#D2B48C" />
        </motion.g>
      )}

      {/* Sparkles for celebration */}
      {state === "celebration" && (
        <>
          <motion.text
            x="15"
            y="20"
            fontSize="12"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], y: [20, 10, 20] }}
            transition={{ duration: 0.8, repeat: 2 }}
          >
            ✨
          </motion.text>
          <motion.text
            x="78"
            y="15"
            fontSize="10"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], y: [15, 5, 15] }}
            transition={{ duration: 0.8, delay: 0.2, repeat: 2 }}
          >
            ⭐
          </motion.text>
        </>
      )}
    </motion.svg>
  );
}
