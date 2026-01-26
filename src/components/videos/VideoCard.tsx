import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Clock, Bookmark, BookmarkCheck, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: string;
  duration: string;
  videoUrl: string;
  difficulty: string;
  category: string;
}

interface VideoCardProps {
  video: Video;
  isSaved?: boolean;
  onSave?: (video: Video) => void;
  onRemove?: (videoId: string) => void;
  onPlay?: (video: Video) => void;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case "beginner":
      return "bg-health-green text-health-green-light";
    case "intermediate":
      return "bg-health-yellow text-foreground";
    case "advanced":
      return "bg-health-coral text-health-coral-light";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function VideoCard({ video, isSaved = false, onSave, onRemove, onPlay }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [saveAnimating, setSaveAnimating] = useState(false);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaveAnimating(true);
    
    if (isSaved) {
      onRemove?.(video.id);
    } else {
      onSave?.(video);
    }
    
    setTimeout(() => setSaveAnimating(false), 300);
  };

  return (
    <motion.div
      className="rounded-xl overflow-hidden cursor-pointer group border border-border hover:border-primary/30 transition-all hover:shadow-xl bg-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onPlay?.(video)}
      layout
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <motion.img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Play overlay */}
        <motion.div
          className="absolute inset-0 bg-foreground/40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          <motion.div
            className="h-14 w-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg"
            initial={{ scale: 0.8 }}
            animate={{ scale: isHovered ? 1.1 : 0.8 }}
            whileHover={{ scale: 1.2 }}
          >
            <Play className="h-6 w-6 text-primary-foreground ml-1" />
          </motion.div>
        </motion.div>

        {/* Duration badge */}
        <Badge className="absolute bottom-2 left-2 bg-foreground/80 text-primary-foreground text-xs backdrop-blur-sm">
          <Clock className="h-3 w-3 mr-1" />
          {video.duration}
        </Badge>

        {/* Save button */}
        <motion.div
          className="absolute top-2 right-2"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full backdrop-blur-sm",
              isSaved 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "bg-foreground/60 text-primary-foreground hover:bg-foreground/80"
            )}
            onClick={handleSaveToggle}
          >
            <AnimatePresence mode="wait">
              {isSaved ? (
                <motion.div
                  key="saved"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: saveAnimating ? 1.3 : 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                >
                  <BookmarkCheck className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="unsaved"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Bookmark className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h4 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
          {video.title}
        </h4>
        
        <p className="text-xs text-muted-foreground line-clamp-2">
          {video.description}
        </p>

        <div className="flex items-center justify-between pt-2">
          <Badge className={cn("text-xs", getDifficultyColor(video.difficulty))}>
            {video.difficulty}
          </Badge>
          
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            {video.channel}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
