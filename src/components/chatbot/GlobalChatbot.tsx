import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FloatingChatButton } from "./FloatingChatButton";
import { ChatWindow } from "./ChatWindow";

export function GlobalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const location = useLocation();

  // Show unread indicator after a delay on first visit
  useEffect(() => {
    const hasSeenChatbot = localStorage.getItem("hasSeenChatbot");
    if (!hasSeenChatbot) {
      const timer = setTimeout(() => {
        setHasUnread(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnread(false);
    localStorage.setItem("hasSeenChatbot", "true");
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <ChatWindow 
        isOpen={isOpen} 
        onClose={handleClose} 
        currentContext={location.pathname}
      />
      <FloatingChatButton 
        isOpen={isOpen} 
        onClick={isOpen ? handleClose : handleOpen}
        hasUnread={hasUnread}
      />
    </>
  );
}
