import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface PillTab {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface PillTabsProps {
  tabs: PillTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function PillTabs({ tabs, activeTab, onTabChange, className }: PillTabsProps) {
  return (
    <ScrollArea className="w-full">
      <div className={cn("flex gap-2 pb-2", className)}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div
                  layoutId="pill-tabs-bg"
                  className="absolute inset-0 rounded-full gradient-bg shadow-lg"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4" />}
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" className="h-1.5" />
    </ScrollArea>
  );
}

interface PillTabsContentProps {
  children: React.ReactNode;
  className?: string;
}

export function PillTabsContent({ children, className }: PillTabsContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn("mt-6", className)}
    >
      {children}
    </motion.div>
  );
}
