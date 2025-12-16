import { useState } from "react";
import { motion } from "framer-motion";
import {
  PlayCircle,
  Search,
  Clock,
  Star,
  Filter,
  X,
  Play,
  Dumbbell,
  Apple,
  Sparkles,
  Brain,
  Activity,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  category: string;
  duration: string;
  difficulty: string;
  thumbnail: string;
  videoUrl: string;
  featured?: boolean;
}

const categories = [
  { id: "all", label: "All", icon: Filter },
  { id: "fitness", label: "Fitness", icon: Dumbbell },
  { id: "nutrition", label: "Nutrition", icon: Apple },
  { id: "skincare", label: "Skincare", icon: Sparkles },
  { id: "meditation", label: "Meditation", icon: Brain },
  { id: "stretching", label: "Stretching", icon: Activity },
];

const videos: Video[] = [
  {
    id: "1",
    title: "Full Body HIIT Workout",
    description: "High-intensity interval training for maximum calorie burn in minimum time.",
    category: "fitness",
    duration: "25 min",
    difficulty: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/embed/ml6cT4AZdqI",
    featured: true,
  },
  {
    id: "2",
    title: "Morning Yoga Flow",
    description: "Start your day with this energizing yoga sequence to wake up your body and mind.",
    category: "stretching",
    duration: "20 min",
    difficulty: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/embed/v7AYKMP6rOE",
    featured: true,
  },
  {
    id: "3",
    title: "Healthy Meal Prep Guide",
    description: "Learn how to prepare a week's worth of nutritious meals in just 2 hours.",
    category: "nutrition",
    duration: "30 min",
    difficulty: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dBnniua6-oM",
  },
  {
    id: "4",
    title: "5-Minute Guided Meditation",
    description: "Quick mindfulness session for stress relief and mental clarity.",
    category: "meditation",
    duration: "5 min",
    difficulty: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/embed/inpok4MKVLM",
  },
  {
    id: "5",
    title: "Complete Skincare Routine",
    description: "Step-by-step guide to building an effective morning and evening skincare routine.",
    category: "skincare",
    duration: "15 min",
    difficulty: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/embed/OrElyY7MFVs",
  },
  {
    id: "6",
    title: "Strength Training Basics",
    description: "Learn proper form and technique for fundamental strength exercises.",
    category: "fitness",
    duration: "35 min",
    difficulty: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/embed/U0bhE67HuDY",
  },
  {
    id: "7",
    title: "Anti-Aging Skincare Tips",
    description: "Expert advice on preventing and reducing signs of aging with the right products.",
    category: "skincare",
    duration: "12 min",
    difficulty: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/embed/1TU_1hxqGJY",
  },
  {
    id: "8",
    title: "Post-Workout Stretching",
    description: "Essential stretches to improve flexibility and prevent injury after exercise.",
    category: "stretching",
    duration: "10 min",
    difficulty: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=450&fit=crop",
    videoUrl: "https://www.youtube.com/embed/L_xrDAtykMI",
  },
];

export default function VideoTutorials() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredVideos = videos.filter((v) => v.featured);

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

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Video Tutorials</h1>
          <p className="text-muted-foreground">Learn from expert-led health and wellness videos</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-focus"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="gap-1"
              >
                <category.icon className="h-3 w-3" />
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Videos */}
        {selectedCategory === "all" && !searchQuery && (
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-health-yellow" />
              Featured Tutorials
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {featuredVideos.map((video) => (
                <Card
                  key={video.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="relative aspect-video">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center">
                        <Play className="h-8 w-8 text-primary-foreground ml-1" />
                      </div>
                    </div>
                    <Badge className="absolute top-3 left-3 bg-health-yellow text-foreground">
                      Featured
                    </Badge>
                    <Badge className="absolute bottom-3 right-3 bg-foreground/80 text-primary-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {video.duration}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-1">{video.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary">{video.category}</Badge>
                      <Badge className={getDifficultyColor(video.difficulty)}>
                        {video.difficulty}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Videos */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-primary" />
            {selectedCategory === "all" ? "All Tutorials" : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Tutorials`}
            <span className="text-sm font-normal text-muted-foreground">
              ({filteredVideos.length} videos)
            </span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVideos.map((video) => (
              <Card
                key={video.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative aspect-video">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-12 w-12 rounded-full bg-primary/90 flex items-center justify-center">
                      <Play className="h-6 w-6 text-primary-foreground ml-0.5" />
                    </div>
                  </div>
                  <Badge className="absolute bottom-2 right-2 bg-foreground/80 text-primary-foreground text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {video.duration}
                  </Badge>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm text-foreground mb-1 line-clamp-1">
                    {video.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {video.description}
                  </p>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {video.category}
                    </Badge>
                    <Badge className={`text-xs ${getDifficultyColor(video.difficulty)}`}>
                      {video.difficulty}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No videos found matching your criteria.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Clear Filters
              </Button>
            </Card>
          )}
        </section>

        {/* Video Modal */}
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden">
            <DialogHeader className="p-4 pb-0">
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-xl">{selectedVideo?.title}</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedVideo?.description}
                  </p>
                </div>
              </div>
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
              <Badge variant="secondary">{selectedVideo?.category}</Badge>
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
      </motion.div>
    </AppLayout>
  );
}
