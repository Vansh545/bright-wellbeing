import { useState } from "react";
import { motion } from "framer-motion";
import { Video } from "./VideoCard";
import { PersonalizedRecommendations } from "./PersonalizedRecommendations";
import { SavedVideosSection } from "./SavedVideosSection";

interface VideoTutorialTabProps {
  category: string;
  title?: string;
}

export function VideoTutorialTab({ category, title }: VideoTutorialTabProps) {
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Personalized Recommendations */}
      <PersonalizedRecommendations
        category={category}
        title={title || "Recommended For You"}
        onPlay={setPlayingVideo}
      />

      {/* Saved Videos */}
      <SavedVideosSection
        category={category}
        onPlay={setPlayingVideo}
      />
    </motion.div>
  );
}
