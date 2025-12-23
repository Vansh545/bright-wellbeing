import { useState } from "react";
import { PlayCircle, Clock, Play } from "lucide-react";
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

export function VideoTutorialSection({ title, videos }: VideoTutorialSectionProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {videos.map((video) => (
              <div
                key={video.id}
                className="rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group border border-border"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative aspect-video">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-10 w-10 rounded-full bg-primary/90 flex items-center justify-center">
                      <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                    </div>
                  </div>
                  <Badge className="absolute bottom-2 right-2 bg-foreground/80 text-primary-foreground text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {video.duration}
                  </Badge>
                </div>
                <div className="p-3 bg-card">
                  <h4 className="font-medium text-sm text-foreground line-clamp-1">
                    {video.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {video.description}
                  </p>
                  <Badge className={`text-xs mt-2 ${getDifficultyColor(video.difficulty)}`}>
                    {video.difficulty}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-lg">{selectedVideo?.title}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedVideo?.description}
            </p>
          </DialogHeader>
          <div className="aspect-video bg-foreground">
            {selectedVideo && (
              <iframe
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
        </DialogContent>
      </Dialog>
    </>
  );
}
