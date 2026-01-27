import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  Dumbbell,
  Sparkles,
  BarChart3,
  Upload,
  Settings,
  X,
  Heart,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  onClose?: () => void;
}

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/ai-consultant", icon: Bot, label: "AI Consultant" },
  { to: "/chatbot", icon: MessageSquare, label: "AI Chatbot" },
  { to: "/fitness", icon: Dumbbell, label: "Fitness Tracker" },
  { to: "/health-tracking", icon: Heart, label: "Health Tracking" },
  { to: "/skincare", icon: Sparkles, label: "Skincare Tracker" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/import", icon: Upload, label: "Import Data" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const sidebarVariants = {
  initial: { x: -20, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
  },
};

const itemVariants = {
  initial: { x: -20, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
  },
};

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  // Get user initials from email
  const getUserInitials = () => {
    if (!user?.email) return "U";
    const email = user.email;
    const name = email.split("@")[0];
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <motion.div 
      className="h-full flex flex-col bg-sidebar border-r border-sidebar-border"
      variants={sidebarVariants}
      initial="initial"
      animate="animate"
    >
      {/* Logo */}
      <motion.div 
        className="p-4 flex items-center justify-between border-b border-sidebar-border"
        variants={itemVariants}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center shadow-glow"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Heart className="h-5 w-5 text-primary-foreground" />
          </motion.div>
          <div>
            <h1 className="font-bold text-lg text-foreground">HealthHub</h1>
            <p className="text-xs text-muted-foreground">Your wellness companion</p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-sidebar-accent"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.to;
          return (
            <motion.div
              key={item.to}
              variants={itemVariants}
              custom={index}
            >
              <NavLink
                to={item.to}
                onClick={onClose}
                className="relative block"
              >
                <motion.div
                  className={cn(
                    "sidebar-item relative overflow-hidden",
                    isActive && "sidebar-item-active"
                  )}
                  whileHover={{ 
                    x: 4,
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Active indicator */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        exit={{ scaleY: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                      />
                    )}
                  </AnimatePresence>
                  
                  <motion.div
                    animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                  </motion.div>
                  <span>{item.label}</span>
                  
                  {/* Hover glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 pointer-events-none"
                    whileHover={{ opacity: 1 }}
                  />
                </motion.div>
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* User section */}
      <motion.div 
        className="p-4 border-t border-sidebar-border"
        variants={itemVariants}
      >
        <motion.div 
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          whileHover={{ scale: 1.02 }}
        >
          <motion.div 
            className="h-9 w-9 rounded-full bg-health-teal-light flex items-center justify-center"
            whileHover={{ rotate: 10 }}
          >
            <span className="text-sm font-semibold text-health-teal">{getUserInitials()}</span>
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.email?.split("@")[0] || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || ""}
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-sidebar-accent hover:text-destructive"
              onClick={handleSignOut}
              title="Sign out"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}