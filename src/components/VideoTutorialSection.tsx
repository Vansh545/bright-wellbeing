import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, Clock, Play, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  thumbnail: string;
  videoUrl: string;
}

interface VideoTutorialSectionProps {
  title: string;
  videos: Video[];
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

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

export function VideoTutorialSection({ title, videos }: VideoTutorialSectionProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <PlayCircle className="h-4 w-4 text-primary" />
            </motion.div>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="grid sm:grid-cols-2 gap-3"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-lg overflow-hidden cursor-pointer group border border-border hover:border-primary/30 transition-all hover:shadow-lg"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <motion.img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div 
                    className="absolute inset-0 bg-foreground/40 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    <motion.div 
                      className="h-14 w-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg"
                      initial={{ scale: 0.8 }}
                      whileHover={{ scale: 1.1 }}
                      animate={{ 
                        boxShadow: [
                          "0 0 0 0 rgba(var(--primary), 0.4)",
                          "0 0 0 20px rgba(var(--primary), 0)",
                        ],
                      }}
                      transition={{
                        boxShadow: { duration: 1.5, repeat: Infinity },
                      }}
                    >
                      <Play className="h-6 w-6 text-primary-foreground ml-1" />
                    </motion.div>
                  </motion.div>
                  <Badge className="absolute bottom-2 right-2 bg-foreground/80 text-primary-foreground text-xs backdrop-blur-sm">
                    <Clock className="h-3 w-3 mr-1" />
                    {video.duration}
                  </Badge>
                </div>
                <div className="p-3 bg-card">
                  <h4 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {video.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {video.description}
                  </p>
                  <Badge className={`text-xs mt-2 ${getDifficultyColor(video.difficulty)}`}>
                    {video.difficulty}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <DialogHeader className="p-4 pb-0">
              <DialogTitle className="text-lg">{selectedVideo?.title}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {selectedVideo?.description}
              </p>
            </DialogHeader>
            <div className="aspect-video bg-foreground">
              {selectedVideo && (
                <motion.iframe
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
            <div className="p-4 flex items-center gap-2">
              <Badge className={getDifficultyColor(selectedVideo?.difficulty || "")}>
                {selectedVideo?.difficulty}
              </Badge>
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {selectedVideo?.duration}
              </Badge>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}