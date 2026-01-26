import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VideoRecommendation {
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

interface RequestBody {
  category: string;
  userPreferences?: {
    preferredDifficulty?: string;
    interests?: string[];
    avoidedTopics?: string[];
  };
  watchHistory?: string[];
  savedVideos?: string[];
}

// Wellbeing-focused search queries for each category
const categoryQueries: Record<string, string[]> = {
  fitness: [
    "beginner home workout routine",
    "HIIT workout for beginners",
    "strength training tutorial",
    "yoga for flexibility",
    "cardio workout at home",
    "weight loss exercise routine",
    "muscle building workout",
    "stretching routine for recovery",
  ],
  skincare: [
    "skincare routine for beginners",
    "anti aging skincare tips",
    "natural skincare tutorial",
    "acne treatment routine",
    "moisturizing skincare routine",
    "vitamin c serum benefits",
    "sunscreen application guide",
    "night skincare routine",
  ],
  wellness: [
    "meditation for beginners",
    "stress relief techniques",
    "mindfulness practice guide",
    "sleep improvement tips",
    "breathing exercises for calm",
    "mental health wellness",
    "self care routine ideas",
    "healthy lifestyle habits",
  ],
  nutrition: [
    "healthy meal prep ideas",
    "balanced diet guide",
    "protein rich recipes",
    "healthy breakfast ideas",
    "weight loss diet tips",
    "nutrient dense foods",
    "healthy snack recipes",
    "hydration tips for health",
  ],
};

// Safe content keywords to prioritize
const safeContentKeywords = [
  "educational",
  "tutorial",
  "guide",
  "beginner",
  "health",
  "wellness",
  "fitness",
  "self-care",
  "routine",
  "tips",
];

// Keywords to avoid
const avoidKeywords = [
  "extreme",
  "dangerous",
  "fast weight loss",
  "miracle",
  "crash diet",
  "pills",
  "supplements controversy",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Verify user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: RequestBody = await req.json();
    const { category, userPreferences, watchHistory = [], savedVideos = [] } = body;

    // Get YouTube API key from app_settings
    const { data: apiKeyData } = await supabaseClient
      .from("app_settings")
      .select("setting_value")
      .eq("setting_key", "youtube_api_key")
      .maybeSingle();

    const youtubeApiKey = apiKeyData?.setting_value;

    if (!youtubeApiKey) {
      // Return fallback recommendations when no API key is configured
      const fallbackVideos = getFallbackRecommendations(category, userPreferences);
      return new Response(
        JSON.stringify({ 
          videos: fallbackVideos, 
          source: "fallback",
          message: "Using curated recommendations. Configure YouTube API key for personalized content." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build search query based on category and preferences
    const queries = categoryQueries[category] || categoryQueries.wellness;
    const interests = userPreferences?.interests || [];
    
    // Select random queries, favoring user interests
    let searchQuery = queries[Math.floor(Math.random() * queries.length)];
    if (interests.length > 0) {
      const randomInterest = interests[Math.floor(Math.random() * interests.length)];
      searchQuery = `${randomInterest} ${searchQuery}`;
    }

    // Add safe content keywords
    const safeKeyword = safeContentKeywords[Math.floor(Math.random() * safeContentKeywords.length)];
    searchQuery = `${searchQuery} ${safeKeyword}`;

    // Call YouTube Data API
    const youtubeResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&type=video&maxResults=12&q=${encodeURIComponent(searchQuery)}` +
      `&safeSearch=strict&videoDuration=medium&relevanceLanguage=en` +
      `&key=${youtubeApiKey}`
    );

    if (!youtubeResponse.ok) {
      const errorText = await youtubeResponse.text();
      console.error("YouTube API error:", errorText);
      
      // Return fallback on API error
      const fallbackVideos = getFallbackRecommendations(category, userPreferences);
      return new Response(
        JSON.stringify({ 
          videos: fallbackVideos, 
          source: "fallback",
          message: "API temporarily unavailable. Showing curated recommendations." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const youtubeData = await youtubeResponse.json();
    
    // Get video details for duration
    const videoIds = youtubeData.items?.map((item: any) => item.id.videoId).join(",") || "";
    
    let videoDurations: Record<string, string> = {};
    if (videoIds) {
      const detailsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?` +
        `part=contentDetails&id=${videoIds}&key=${youtubeApiKey}`
      );
      
      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json();
        detailsData.items?.forEach((item: any) => {
          videoDurations[item.id] = parseDuration(item.contentDetails.duration);
        });
      }
    }

    // Transform YouTube results to our format
    const videos: VideoRecommendation[] = (youtubeData.items || [])
      .filter((item: any) => {
        // Filter out videos with avoid keywords
        const title = item.snippet.title.toLowerCase();
        const description = item.snippet.description.toLowerCase();
        return !avoidKeywords.some(keyword => 
          title.includes(keyword) || description.includes(keyword)
        );
      })
      .filter((item: any) => {
        // Filter out already watched or saved videos
        const videoId = item.id.videoId;
        return !watchHistory.includes(videoId) || savedVideos.includes(videoId);
      })
      .map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description.substring(0, 150) + "...",
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        channel: item.snippet.channelTitle,
        duration: videoDurations[item.id.videoId] || "10 min",
        videoUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
        difficulty: inferDifficulty(item.snippet.title, item.snippet.description),
        category: category,
      }));

    // Log watch for recommendation improvement
    await supabaseClient
      .from("user_video_history")
      .upsert({
        user_id: user.id,
        video_id: `search_${Date.now()}`,
        video_title: `Search: ${searchQuery}`,
        category: category,
        watched_at: new Date().toISOString(),
      }, { onConflict: "user_id,video_id" });

    return new Response(
      JSON.stringify({ 
        videos, 
        source: "youtube",
        query: searchQuery 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in video-recommendations:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function parseDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "10 min";
  
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}

function inferDifficulty(title: string, description: string): string {
  const text = (title + " " + description).toLowerCase();
  
  if (text.includes("beginner") || text.includes("easy") || text.includes("simple") || text.includes("intro")) {
    return "Beginner";
  }
  if (text.includes("advanced") || text.includes("intense") || text.includes("challenge") || text.includes("expert")) {
    return "Advanced";
  }
  return "Intermediate";
}

function getFallbackRecommendations(category: string, preferences?: any): VideoRecommendation[] {
  const fallbackData: Record<string, VideoRecommendation[]> = {
    fitness: [
      {
        id: "fitness-1",
        title: "30-Minute Full Body Workout for Beginners",
        description: "A complete full-body workout designed for beginners. No equipment needed, follow along at home.",
        thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=450&fit=crop",
        channel: "FitLife",
        duration: "30 min",
        videoUrl: "https://www.youtube.com/embed/ml6cT4AZdqI",
        difficulty: "Beginner",
        category: "fitness",
      },
      {
        id: "fitness-2",
        title: "HIIT Cardio Workout - Fat Burning",
        description: "High-intensity interval training to boost metabolism and burn calories effectively.",
        thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=450&fit=crop",
        channel: "CardioKing",
        duration: "25 min",
        videoUrl: "https://www.youtube.com/embed/U0bhE67HuDY",
        difficulty: "Intermediate",
        category: "fitness",
      },
      {
        id: "fitness-3",
        title: "Morning Yoga Flow for Energy",
        description: "Start your day with this energizing yoga sequence to wake up your body and mind.",
        thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=450&fit=crop",
        channel: "YogaDaily",
        duration: "20 min",
        videoUrl: "https://www.youtube.com/embed/v7AYKMP6rOE",
        difficulty: "Beginner",
        category: "fitness",
      },
      {
        id: "fitness-4",
        title: "Strength Training Fundamentals",
        description: "Learn proper form and technique for fundamental strength exercises.",
        thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=450&fit=crop",
        channel: "StrengthLab",
        duration: "35 min",
        videoUrl: "https://www.youtube.com/embed/L_xrDAtykMI",
        difficulty: "Beginner",
        category: "fitness",
      },
    ],
    skincare: [
      {
        id: "skincare-1",
        title: "Complete Skincare Routine Guide",
        description: "Step-by-step guide to building an effective morning and evening skincare routine.",
        thumbnail: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=450&fit=crop",
        channel: "SkinCareScience",
        duration: "15 min",
        videoUrl: "https://www.youtube.com/embed/OrElyY7MFVs",
        difficulty: "Beginner",
        category: "skincare",
      },
      {
        id: "skincare-2",
        title: "Anti-Aging Skincare Secrets",
        description: "Expert advice on preventing and reducing signs of aging with the right products.",
        thumbnail: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=450&fit=crop",
        channel: "GlowUp",
        duration: "12 min",
        videoUrl: "https://www.youtube.com/embed/1TU_1hxqGJY",
        difficulty: "Intermediate",
        category: "skincare",
      },
      {
        id: "skincare-3",
        title: "Natural Skincare DIY Recipes",
        description: "Create effective skincare products at home using natural ingredients.",
        thumbnail: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&h=450&fit=crop",
        channel: "NaturalBeauty",
        duration: "18 min",
        videoUrl: "https://www.youtube.com/embed/example3",
        difficulty: "Beginner",
        category: "skincare",
      },
      {
        id: "skincare-4",
        title: "Understanding Your Skin Type",
        description: "Learn how to identify your skin type and choose the right products.",
        thumbnail: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&h=450&fit=crop",
        channel: "DermExpert",
        duration: "10 min",
        videoUrl: "https://www.youtube.com/embed/example4",
        difficulty: "Beginner",
        category: "skincare",
      },
    ],
    wellness: [
      {
        id: "wellness-1",
        title: "Meditation for Beginners",
        description: "A gentle introduction to meditation practice for stress relief and mental clarity.",
        thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=450&fit=crop",
        channel: "MindfulLife",
        duration: "15 min",
        videoUrl: "https://www.youtube.com/embed/example5",
        difficulty: "Beginner",
        category: "wellness",
      },
      {
        id: "wellness-2",
        title: "Sleep Improvement Techniques",
        description: "Science-backed methods to improve your sleep quality and wake up refreshed.",
        thumbnail: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=450&fit=crop",
        channel: "SleepWell",
        duration: "20 min",
        videoUrl: "https://www.youtube.com/embed/example6",
        difficulty: "Beginner",
        category: "wellness",
      },
    ],
    nutrition: [
      {
        id: "nutrition-1",
        title: "Healthy Meal Prep for the Week",
        description: "Plan and prepare nutritious meals for the entire week in just a few hours.",
        thumbnail: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=450&fit=crop",
        channel: "NutritionHub",
        duration: "25 min",
        videoUrl: "https://www.youtube.com/embed/example7",
        difficulty: "Beginner",
        category: "nutrition",
      },
      {
        id: "nutrition-2",
        title: "Understanding Macronutrients",
        description: "Learn about proteins, carbs, and fats and how to balance them for optimal health.",
        thumbnail: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=450&fit=crop",
        channel: "DietScience",
        duration: "18 min",
        videoUrl: "https://www.youtube.com/embed/example8",
        difficulty: "Intermediate",
        category: "nutrition",
      },
    ],
  };

  return fallbackData[category] || fallbackData.wellness;
}
