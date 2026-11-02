"use client";

import React from "react";
import { useRoomStore } from "@/stores/use-room-store";
import { VideoGrid } from "@/components/media/video-grid";
import { YouTubePlayer } from "@/components/games/youtube-player";

export function StageContainer() {
  const { activeActivity } = useRoomStore();

  return (
    <main className="flex-1 h-full flex flex-col relative overflow-hidden bg-zinc-950">
      {activeActivity === "youtube" ? <YouTubePlayer /> : <VideoGrid />}
    </main>
  );
}