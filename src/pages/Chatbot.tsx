import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Loader2,
  RefreshCw,
  Dumbbell,
  Apple,
  Sparkles,
  Brain,
  Heart,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickTopics = [
  { label: "Fitness Tips", icon: Dumbbell },
  { label: "Nutrition Advice", icon: Apple },
  { label: "Skincare Help", icon: Sparkles },
  { label: "Mental Health", icon: Brain },
  { label: "General Wellness", icon: Heart },
];

const initialMessages: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "Hello! 👋 I'm your personal wellness assistant. I'm here to help you with fitness tips, nutrition advice, skincare routines, and general health questions. How can I help you today?",
    timestamp: new Date(),
  },
];

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("chatHistory");
    return saved ? JSON.parse(saved) : initialMessages;
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState(() => localStorage.getItem("chatUserName") || "");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const responses: Record<string, string> = {
      fitness: "Great question about fitness! Here are some tips:\n\n1. **Start with compound exercises** - Squats, deadlifts, and bench press work multiple muscle groups.\n\n2. **Progressive overload** - Gradually increase weight or reps to build strength.\n\n3. **Rest is crucial** - Allow 48 hours between training the same muscle group.\n\nWould you like me to create a specific workout plan for you?",
      nutrition: "Nutrition is key to achieving your health goals! Here's what I recommend:\n\n• **Protein**: Aim for 1.6-2.2g per kg of body weight\n• **Complex carbs**: Choose whole grains, fruits, and vegetables\n• **Healthy fats**: Include avocados, nuts, and olive oil\n• **Hydration**: Drink at least 2-3 liters of water daily\n\nWant me to suggest a meal plan based on your goals?",
      skincare: "Taking care of your skin is essential! Here's a simple routine:\n\n**Morning:**\n- Gentle cleanser\n- Vitamin C serum\n- Moisturizer with SPF\n\n**Evening:**\n- Double cleanse\n- Treatment (retinol/AHA)\n- Night cream\n\nConsistency is key! Would you like specific product recommendations?",
      mental: "Mental health is just as important as physical health. Here are some practices:\n\n🧘 **Mindfulness**: Even 5 minutes of meditation can help\n📝 **Journaling**: Write down your thoughts and gratitude\n😴 **Sleep**: Aim for 7-9 hours of quality sleep\n🚶 **Movement**: Regular exercise boosts mood\n\nRemember, it's okay to seek professional help when needed.",
      default: "That's a great question! While I provide general wellness guidance, remember that personalized advice from healthcare professionals is always recommended for specific concerns.\n\nIs there a particular area you'd like to focus on? I can help with:\n- Fitness and exercise\n- Nutrition and diet\n- Skincare routines\n- Mental wellness\n- General health tips",
    };

    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes("fitness") || lowerMessage.includes("workout") || lowerMessage.includes("exercise")) {
      return responses.fitness;
    } else if (lowerMessage.includes("nutrition") || lowerMessage.includes("diet") || lowerMessage.includes("food") || lowerMessage.includes("eat")) {
      return responses.nutrition;
    } else if (lowerMessage.includes("skin") || lowerMessage.includes("face") || lowerMessage.includes("acne")) {
      return responses.skincare;
    } else if (lowerMessage.includes("mental") || lowerMessage.includes("stress") || lowerMessage.includes("anxiety") || lowerMessage.includes("mood")) {
      return responses.mental;
    }
    return responses.default;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const response = await generateResponse(input);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleNewConversation = () => {
    setMessages(initialMessages);
    localStorage.removeItem("chatHistory");
  };

  const handleQuickTopic = (topic: string) => {
    setInput(`Tell me about ${topic.toLowerCase()}`);
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
    <AppLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <Card className="flex-shrink-0 mb-4">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full gradient-bg flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">AI Wellness Assistant</CardTitle>
                  <p className="text-xs text-muted-foreground">Online • Here to help 24/7</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Your name (optional)"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    localStorage.setItem("chatUserName", e.target.value);
                  }}
                  className="w-36 h-8 text-sm"
                />
                <Button variant="outline" size="sm" onClick={handleNewConversation}>
                  <RefreshCw className="h-4 w-4" />
                  New Chat
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Messages Area */}
        <Card className="flex-1 overflow-hidden flex flex-col">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    className={`flex items-start gap-2 max-w-[80%] ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === "user"
                          ? "bg-primary/10"
                          : "gradient-bg"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="h-4 w-4 text-primary" />
                      ) : (
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <div
                        className={`${
                          message.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
                        } whitespace-pre-wrap`}
                      >
                        {message.content}
                      </div>
                      <p
                        className={`text-xs text-muted-foreground mt-1 ${
                          message.role === "user" ? "text-right" : ""
                        }`}
                      >
                        {message.role === "user" && userName
                          ? `${userName} • `
                          : ""}
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
                <div className="h-8 w-8 rounded-full gradient-bg flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="chat-bubble-ai flex items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Typing...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Quick Topics */}
          <div className="px-4 py-2 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {quickTopics.map((topic) => (
                <Badge
                  key={topic.label}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => handleQuickTopic(topic.label)}
                >
                  <topic.icon className="h-3 w-3 mr-1" />
                  {topic.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about health & wellness..."
                className="flex-1 input-focus"
                disabled={isTyping}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                variant="gradient"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
