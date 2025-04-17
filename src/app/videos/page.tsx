"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Interface matching the video list data from GET /api/videos
interface VideoListData {
  _id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string; // Optional thumbnail
  duration?: number; // Optional duration
  accessLevel: "public" | "free" | "pro" | "admin";
  createdAt: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoListData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoading) return;

    if (!token) {
      router.push("/admin/login");
      return;
    }

    const fetchVideos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_BACKEND_API_URL ||
          "http://localhost:5001/api";
        const response = await fetch(`${apiUrl}/videos`, {
          // Fetch from /api/videos
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403)
            throw new Error("Unauthorized to view videos.");
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: VideoListData[] = await response.json();
        setVideos(data);
      } catch (err: unknown) {
        console.error("Failed to fetch videos:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred fetching videos."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [token, isAuthLoading, router]);

  // --- Render Logic ---
  if (isLoading || isAuthLoading) {
    return <div className="text-center p-6">Loading videos...</div>;
  }

  if (error) {
    return <div className="text-center p-6 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Available Videos</h1>
      {videos.length === 0 ? (
        <p>No videos available for you at this time.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <Link
              key={video._id}
              href={`/videos/${video._id}`}
              className="block group"
            >
              <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
                {/* Basic Thumbnail Placeholder */}
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-400 group-hover:opacity-90">
                  {video.thumbnailUrl ? (
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>No Thumbnail</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1 group-hover:text-indigo-600 truncate">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {video.description || "No description."}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{video.accessLevel}</span>

                    <span>
                      {video.duration
                        ? `${Math.round(video.duration / 60)} min`
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
