import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, AlertCircle, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoCard, Video } from "./VideoCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface PersonalizedRecommendationsProps {
  category: string;
  title?: string;
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
};

export function PersonalizedRecommendations({ 
  category, 
  title = "Recommended For You",
  onPlay 
}: PersonalizedRecommendationsProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [savedVideoIds, setSavedVideoIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [source, setSource] = useState<string>("fallback");
  const [apiMessage, setApiMessage] = useState<string>("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchSavedVideoIds = useCallback(async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from("saved_videos")
        .select("video_id")
        .eq("user_id", user.id);

      if (data) {
        setSavedVideoIds(new Set(data.map((v) => v.video_id)));
      }
    } catch (error) {
      console.error("Error fetching saved video IDs:", error);
    }
  }, [user]);

  const fetchRecommendations = useCallback(async (showRefreshToast = false) => {
    if (!user) return;

    if (showRefreshToast) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      // Get user preferences
      const { data: prefsData } = await supabase
        .from("user_video_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Get watch history
      const { data: historyData } = await supabase
        .from("user_video_history")
        .select("video_id")
        .eq("user_id", user.id)
        .eq("category", category)
        .limit(50);

      const watchHistory = historyData?.map((h) => h.video_id) || [];

      // Call edge function
      const { data: session } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke("video-recommendations", {
        body: {
          category,
          userPreferences: prefsData || {},
          watchHistory,
          savedVideos: Array.from(savedVideoIds),
        },
      });

      if (response.error) throw response.error;

      const result = response.data;
      setVideos(result.videos || []);
      setSource(result.source || "fallback");
      setApiMessage(result.message || "");

      if (showRefreshToast) {
        toast({
          title: "Recommendations refreshed",
          description: "New personalized videos are ready for you!",
        });
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast({
        title: "Error loading recommendations",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, category, savedVideoIds, toast]);

  useEffect(() => {
    fetchSavedVideoIds();
  }, [fetchSavedVideoIds]);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user, category]);

  const handleSaveVideo = async (video: Video) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("saved_videos").insert({
        user_id: user.id,
        video_id: video.id,
        video_title: video.title,
        video_thumbnail: video.thumbnail,
        video_channel: video.channel,
        video_duration: video.duration,
        video_url: video.videoUrl,
        category: video.category,
      });

      if (error) throw error;

      setSavedVideoIds((prev) => new Set(prev).add(video.id));
      
      toast({
        title: "Video saved!",
        description: "Added to your saved videos.",
      });
    } catch (error: any) {
      if (error.code === "23505") {
        toast({
          title: "Already saved",
          description: "This video is already in your saved list.",
        });
      } else {
        console.error("Error saving video:", error);
        toast({
          title: "Error",
          description: "Failed to save video. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveVideo = async (videoId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("saved_videos")
        .delete()
        .eq("user_id", user.id)
        .eq("video_id", videoId);

      if (error) throw error;

      setSavedVideoIds((prev) => {
        const updated = new Set(prev);
        updated.delete(videoId);
        return updated;
      });

      toast({
        title: "Video removed",
        description: "Removed from your saved videos.",
      });
    } catch (error) {
      console.error("Error removing video:", error);
    }
  };

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video);
    
    // Log to history
    if (user) {
      supabase.from("user_video_history").upsert({
        user_id: user.id,
        video_id: video.id,
        video_title: video.title,
        video_thumbnail: video.thumbnail,
        video_channel: video.channel,
        video_duration: video.duration,
        category: video.category,
        watched_at: new Date().toISOString(),
      }, { onConflict: "user_id,video_id" }).then(() => {
        // Silent update
      });
    }

    onPlay?.(video);
  };

  if (isLoading) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
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

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-4 w-4 text-primary" />
              </motion.div>
              {title}
              {source === "youtube" && (
                <Badge variant="outline" className="text-xs font-normal">
                  Personalized
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {source === "fallback" && apiMessage && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1 text-xs text-muted-foreground"
                >
                  <AlertCircle className="h-3 w-3" />
                  <span className="hidden sm:inline">Configure API for personalized content</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => navigate("/settings")}
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Settings
                  </Button>
                </motion.div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchRecommendations(true)}
                disabled={isRefreshing}
                className="h-8"
              >
                <motion.div
                  animate={isRefreshing ? { rotate: 360 } : {}}
                  transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.div>
                <span className="ml-1 hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {videos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 text-muted-foreground"
            >
              <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No recommendations available</p>
              <p className="text-xs mt-1">Try refreshing or check back later</p>
            </motion.div>
          ) : (
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="initial"
              animate="animate"
            >
              {videos.map((video) => (
                <motion.div key={video.id} variants={itemVariants}>
                  <VideoCard
                    video={video}
                    isSaved={savedVideoIds.has(video.id)}
                    onSave={handleSaveVideo}
                    onRemove={handleRemoveVideo}
                    onPlay={handlePlayVideo}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <DialogHeader className="p-4 pb-0">
              <DialogTitle className="text-lg pr-8">{selectedVideo?.title}</DialogTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">
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
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={selectedVideo?.difficulty === "Beginner" ? "bg-health-green" : selectedVideo?.difficulty === "Advanced" ? "bg-health-coral" : "bg-health-yellow"}>
                  {selectedVideo?.difficulty}
                </Badge>
                <Badge variant="outline">
                  {selectedVideo?.duration}
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">{selectedVideo?.channel}</span>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
