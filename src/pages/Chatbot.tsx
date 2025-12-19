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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const { toast } = useToast();
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

  const handleSend = async () => {
    if (!input.trim()) return;

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
      // Prepare messages for API (exclude the welcome message for cleaner context)
      const apiMessages = updatedMessages
        .filter(msg => msg.id !== 'welcome')
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      const { data, error } = await supabase.functions.invoke('wellness-chat', {
        body: {
          messages: apiMessages,
          userName: userName || undefined,
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Message Failed",
        description: error instanceof Error ? error.message : "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
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
