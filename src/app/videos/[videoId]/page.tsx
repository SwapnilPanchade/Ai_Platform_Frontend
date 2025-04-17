// frontend/src/app/videos/[videoId]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import MuxPlayer from "@mux/mux-player-react"; // Import Mux Player

// Interface matching the single video detail from GET /api/videos/:videoId
interface VideoDetailData {
  _id: string;
  title: string;
  description?: string;
  duration?: number;
  accessLevel: string;
  muxPlaybackId?: string; // Playback ID is crucial
  thumbnailUrl?: string;
  createdAt: string;
}

export default function VideoPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isLoading: isAuthLoading } = useAuth();

  const [videoData, setVideoData] = useState<VideoDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const videoIdParam = params?.videoId;
  const videoId = Array.isArray(videoIdParam) ? videoIdParam[0] : videoIdParam;

  useEffect(() => {
    // Wait for auth and valid videoId
    if (isAuthLoading || !token || !videoId) {
      setIsLoading(isAuthLoading);
      if (!isAuthLoading && !token) setError("Not authenticated.");
      if (!isAuthLoading && !videoId) setError("Video ID missing from URL.");
      return;
    }

    const fetchVideoDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_BACKEND_API_URL ||
          "http://localhost:5001/api";
        const response = await fetch(`${apiUrl}/videos/${videoId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 404)
            throw new Error("Video not found or processing.");
          if (response.status === 401 || response.status === 403)
            throw new Error("Access Denied.");
          const errorText = await response.text();
          throw new Error(`HTTP error ${response.status}: ${errorText}`);
        }

        const data: VideoDetailData = await response.json();

        // Check specifically for playback ID needed by Mux Player
        if (!data.muxPlaybackId) {
          throw new Error(
            "Video data received, but playback information is missing."
          );
        }

        setVideoData(data);
      } catch (err: unknown) {
        console.error("Failed to fetch video details:", err);
        setError(err instanceof Error ? err.message : "An error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoDetails();
  }, [videoId, token, isAuthLoading]); // Re-fetch if ID or token changes

  // --- Render Logic ---
  return (
    <div className="container mx-auto p-4 md:p-6">
      <button
        onClick={() => router.back()} // Go back to the previous page (video list)
        className="mb-4 text-sm text-blue-600 hover:underline"
      >
        ← Back to Videos
      </button>

      {isAuthLoading || isLoading ? (
        <div className="text-center py-10">Loading video...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded">
          Error: {error}
        </div>
      ) : !videoData ? (
        <div className="text-center py-10 text-gray-500">
          Video data not found.
        </div>
      ) : (
        // --- Video Loaded Successfully ---
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            {videoData.title}
          </h1>
          {/* Video Player Area */}
          <div className="aspect-video mb-4 bg-black rounded-lg overflow-hidden shadow-lg">
            {/* Use Mux Player component */}
            <MuxPlayer
              streamType="on-demand" // For pre-recorded video
              playbackId={videoData.muxPlaybackId} // Pass the playback ID fetched from API
              metadata={{
                // Optional metadata for analytics/player
                video_id: videoData._id,
                video_title: videoData.title,
                // user_id: user?.id // Pass user ID if available and needed
              }}
              // Add other MuxPlayer props as needed (e.g., controls, autoplay)
              // See: https://github.com/muxinc/mux-player-react
              // Example:
              // primaryColor="#FFFFFF"
              // secondaryColor="#000000"
              // title={videoData.title} // Adds title overlay
              className="w-full h-full"
            />
          </div>

          {/* Video Description */}
          {videoData.description && (
            <div className="prose max-w-none mt-4 mb-6">
              {" "}
              {/* Use Tailwind prose for nice text formatting */}
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p>{videoData.description}</p>
            </div>
          )}

          {/* Other Details (Optional) */}
          <div className="text-sm text-gray-600 border-t pt-4">
            <p>
              Access Level:{" "}
              <span className="font-medium">{videoData.accessLevel}</span>
            </p>
            <p>
              Uploaded: {new Date(videoData.createdAt).toLocaleDateString()}
            </p>
            {/* Add duration if available */}
          </div>
        </div>
      )}
    </div>
  );
}
