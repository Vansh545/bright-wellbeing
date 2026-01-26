import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Trash2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VideoCard, Video } from "./VideoCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface SavedVideosSectionProps {
  category?: string;
  onPlay?: (video: Video) => void;
}

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

export function SavedVideosSection({ category, onPlay }: SavedVideosSectionProps) {
  const [savedVideos, setSavedVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSavedVideos = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from("saved_videos")
        .select("*")
        .eq("user_id", user.id)
        .order("saved_at", { ascending: false });

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;

      const videos: Video[] = (data || []).map((item) => ({
        id: item.video_id,
        title: item.video_title,
        description: "",
        thumbnail: item.video_thumbnail || "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=450&fit=crop",
        channel: item.video_channel || "Unknown",
        duration: item.video_duration || "10 min",
        videoUrl: item.video_url || `https://www.youtube.com/embed/${item.video_id}`,
        difficulty: "Intermediate",
        category: item.category,
      }));

      setSavedVideos(videos);
    } catch (error) {
      console.error("Error fetching saved videos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedVideos();
  }, [user, category]);

  const handleRemoveVideo = async (videoId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("saved_videos")
        .delete()
        .eq("user_id", user.id)
        .eq("video_id", videoId);

      if (error) throw error;

      setSavedVideos((prev) => prev.filter((v) => v.id !== videoId));
      
      toast({
        title: "Video removed",
        description: "Video has been removed from your saved list.",
      });
    } catch (error) {
      console.error("Error removing video:", error);
      toast({
        title: "Error",
        description: "Failed to remove video. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-primary" />
            Saved Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (savedVideos.length === 0) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-primary" />
            Saved Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 text-muted-foreground"
          >
            <Bookmark className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No saved videos yet</p>
            <p className="text-xs mt-1">Click the bookmark icon on any video to save it here</p>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Bookmark className="h-4 w-4 text-primary" />
            </motion.div>
            Saved Videos
            <span className="text-xs font-normal text-muted-foreground">
              ({savedVideos.length})
            </span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSavedVideos}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <AnimatePresence>
            {savedVideos.map((video) => (
              <motion.div key={video.id} variants={itemVariants} layout>
                <VideoCard
                  video={video}
                  isSaved={true}
                  onRemove={handleRemoveVideo}
                  onPlay={onPlay}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </CardContent>
    </Card>
  );
}
