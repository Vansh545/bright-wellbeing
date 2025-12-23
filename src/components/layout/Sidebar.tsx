import { NavLink, useLocation } from "react-router-dom";
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
  { to: "/skincare", icon: Sparkles, label: "Skincare Tracker" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/import", icon: Upload, label: "Import Data" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

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
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center shadow-glow">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">HealthHub</h1>
            <p className="text-xs text-muted-foreground">Your wellness companion</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden hover:bg-sidebar-accent"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={cn(
                "sidebar-item",
                isActive && "sidebar-item-active"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-2">
          <div className="h-9 w-9 rounded-full bg-health-teal-light flex items-center justify-center">
            <span className="text-sm font-semibold text-health-teal">{getUserInitials()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.email?.split("@")[0] || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || ""}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-sidebar-accent"
            onClick={handleSignOut}
            title="Sign out"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
}
