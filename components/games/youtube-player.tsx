"use client";

import React, { useState } from "react";
import { Play, Tv, X } from "lucide-react";
import { useRoomStore } from "@/stores/use-room-store";

export function YouTubePlayer() {
  const { setActiveActivity } = useRoomStore();
  const [videoInput, setVideoInput] = useState("");
  const [videoId, setVideoId] = useState("jfKfPfyJRdk"); // Default chill lofi stream

  // Helper to extract video ID from YouTube link
  const handleLoadVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoInput.trim()) return;

    let id = videoInput.trim();
    if (id.includes("v=")) {
      id = id.split("v=")[1]?.split("&")[0];
    } else if (id.includes("youtu.be/")) {
      id = id.split("youtu.be/")[1]?.split("?")[0];
    }

    if (id) {
      setVideoId(id);
      setVideoInput("");
    }
  };

  return (
    <div className="flex-1 w-full h-full p-4 flex flex-col items-center justify-center max-w-5xl mx-auto">
      {/* Top Bar with URL input */}
      <div className="w-full flex items-center justify-between gap-3 mb-3 bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl">
        <div className="flex items-center gap-2 text-zinc-300 text-sm font-medium pl-2">
          <Tv size={18} className="text-amber-400" />
          <span>Watch Together</span>
        </div>

        <form onSubmit={handleLoadVideo} className="flex-1 max-w-md flex gap-2">
          <input
            type="text"
            value={videoInput}
            onChange={(e) => setVideoInput(e.target.value)}
            placeholder="Paste YouTube link..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-xs flex items-center gap-1.5 transition"
          >
            <Play size={14} />
            <span>Play</span>
          </button>
        </form>

        <button
          onClick={() => setActiveActivity("grid")}
          className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
          title="Close Watch Party"
        >
          <X size={18} />
        </button>
      </div>

      {/* Video IFrame Container */}
      <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl relative">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`}
          title="Watch Party Player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}