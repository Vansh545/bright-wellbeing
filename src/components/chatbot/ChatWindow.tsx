import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Minimize2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { useStepTracking } from "@/hooks/useStepTracking";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  currentContext?: string;
}

const contextualGreetings: Record<string, string> = {
  "/": "Welcome to your wellness dashboard! How can I help you track your health today?",
  "/fitness": "I see you're in the Fitness section. Need help with workouts, exercise plans, or tracking your progress?",
  "/skincare": "Looking at skincare? I can help with routines, product advice, or skin concerns!",
  "/analytics": "Analyzing your data? Ask me about trends, insights, or how to improve your metrics!",
  "/ai-consultant": "Ready for personalized health advice? I'm here to guide you!",
  "/settings": "Need help with settings or app configuration?",
  "/import": "Need help importing data from your devices or apps?",
  "/health-tracking": "Tracking your health data? I can help with vital signs, symptoms, or medication tracking!",
};

const proactiveTips = [
  "💡 Tip: Staying hydrated improves both skin health and workout performance!",
  "💡 Tip: Consistency beats intensity. Small daily habits lead to big results!",
  "💡 Tip: Don't forget to log your meals for better nutrition insights!",
  "💡 Tip: A good skincare routine should match your lifestyle and environment.",
  "💡 Tip: Rest days are just as important as workout days for muscle recovery!",
];

export function ChatWindow({ isOpen, onClose, currentContext = "/" }: ChatWindowProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasShownGreeting, setHasShownGreeting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { profile, streak } = useUserProfile();
  const { getWeeklyStats } = useActivityLogs();
  const { stepData } = useStepTracking();
  const weeklyStats = getWeeklyStats();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show greeting on first open with personalized context
  useEffect(() => {
    if (isOpen && !hasShownGreeting) {
      const greeting = contextualGreetings[currentContext] || contextualGreetings["/"];
      
      let personalizedGreeting = `Hi! 👋 I'm your wellbeing guide.\n\n${greeting}`;
      
      // Add personalized context based on user data
      if (profile) {
        if (streak && streak.current_streak > 0) {
          personalizedGreeting += `\n\n🔥 Great job on your ${streak.current_streak}-day streak!`;
        }
        if (weeklyStats.totalWorkouts > 0) {
          personalizedGreeting += ` You've done ${weeklyStats.totalWorkouts} workouts this week.`;
        }
      }
      
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: personalizedGreeting,
          timestamp: new Date(),
        },
      ]);
      setHasShownGreeting(true);
    }
  }, [isOpen, hasShownGreeting, currentContext, profile, streak, weeklyStats]);

  // Show proactive tip occasionally
  useEffect(() => {
    if (isOpen && messages.length > 0 && messages.length % 5 === 0) {
      const randomTip = proactiveTips[Math.floor(Math.random() * proactiveTips.length)];
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `tip-${Date.now()}`,
            role: "assistant",
            content: randomTip,
            timestamp: new Date(),
          },
        ]);
      }, 2000);
    }
  }, [isOpen, messages.length]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const apiMessages = updatedMessages
        .filter((msg) => msg.id !== "welcome" && !msg.id.startsWith("tip-"))
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // Build user context for AI
      let userContext = `User is currently viewing: ${currentContext}.`;
      
      if (profile) {
        userContext += ` User profile: Goal is ${profile.fitness_goal?.replace('_', ' ')}, activity level ${profile.activity_level}.`;
        if (streak) {
          userContext += ` Current streak: ${streak.current_streak} days, longest: ${streak.longest_streak} days.`;
        }
        userContext += ` This week: ${weeklyStats.totalWorkouts} workouts, ${weeklyStats.totalCalories} calories burned, ${weeklyStats.activeDays} active days.`;
        userContext += ` Today's steps: ${stepData.steps} of ${stepData.goalSteps} (${Math.round(stepData.percentage)}% of goal).`;
      }
      
      userContext += ` Question: ${input}`;

      const { data, error } = await supabase.functions.invoke("wellness-chat", {
        body: {
          messages: [
            ...apiMessages.slice(0, -1),
            { role: "user", content: userContext },
          ],
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Message Failed",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[70vh] bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full gradient-bg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Wellness Guide</h3>
                <p className="text-xs text-muted-foreground">Always here to help</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-secondary">
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-start gap-2 max-w-[85%] ${
                        message.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === "user" ? "bg-primary/10" : "gradient-bg"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                        )}
                      </div>
                      <div>
                        <div
                          className={`px-3 py-2 rounded-2xl text-sm ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-secondary text-secondary-foreground rounded-bl-md"
                          }`}
                        >
                          {message.content}
                        </div>
                        <p className={`text-xs text-muted-foreground mt-1 ${message.role === "user" ? "text-right" : ""}`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2"
                >
                  <div className="h-7 w-7 rounded-full gradient-bg flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <div className="bg-secondary px-3 py-2 rounded-2xl rounded-bl-md flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-xs text-muted-foreground">Typing...</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border bg-background/50">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 text-sm rounded-full bg-secondary border-0"
                disabled={isTyping}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                size="icon"
                className="rounded-full gradient-bg hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
