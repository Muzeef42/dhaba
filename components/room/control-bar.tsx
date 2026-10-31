"use client";

import React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  Gamepad2,
  MessageSquare,
  PhoneOff,
} from "lucide-react";
import { useRoomStore } from "@/stores/use-room-store";
import { useTrackToggle } from "@livekit/components-react";
import { Track } from "livekit-client";
import { useRouter } from "next/navigation";

export function ControlBar() {
  const router = useRouter();
  const { isChatOpen, toggleChat, activeActivity, setActiveActivity } =
    useRoomStore();

  // LiveKit hooks to toggle audio and video
  const micToggle = useTrackToggle({ source: Track.Source.Microphone });
  const cameraToggle = useTrackToggle({ source: Track.Source.Camera });
  const screenToggle = useTrackToggle({ source: Track.Source.ScreenShare });

  return (
    <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-2xl">
      {/* Mic Button */}
      <button
        onClick={() => micToggle.toggle()}
        className={`p-3 rounded-xl transition-all ${
          micToggle.enabled
            ? "bg-zinc-800 hover:bg-zinc-700 text-white"
            : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
        }`}
        title={micToggle.enabled ? "Mute Microphone" : "Unmute Microphone"}
      >
        {micToggle.enabled ? <Mic size={20} /> : <MicOff size={20} />}
      </button>

      {/* Camera Button */}
      <button
        onClick={() => cameraToggle.toggle()}
        className={`p-3 rounded-xl transition-all ${
          cameraToggle.enabled
            ? "bg-zinc-800 hover:bg-zinc-700 text-white"
            : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
        }`}
        title={cameraToggle.enabled ? "Turn Off Camera" : "Turn On Camera"}
      >
        {cameraToggle.enabled ? <Video size={20} /> : <VideoOff size={20} />}
      </button>

      {/* Screen Share Button */}
      <button
        onClick={() => screenToggle.toggle()}
        className={`p-3 rounded-xl transition-all ${
          screenToggle.enabled
            ? "bg-blue-600 text-white"
            : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
        }`}
        title="Share Screen"
      >
        <ScreenShare size={20} />
      </button>

      <div className="w-[1px] h-6 bg-zinc-800 mx-1" />

      {/* Games / Activities Selector */}
      <button
        onClick={() =>
          setActiveActivity(activeActivity === "youtube" ? "grid" : "youtube")
        }
        className={`p-3 rounded-xl transition-all flex items-center gap-2 ${
          activeActivity === "youtube"
            ? "bg-amber-500 text-black font-semibold"
            : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
        }`}
        title="Watch Party / Mini Games"
      >
        <Gamepad2 size={20} />
        <span className="text-xs hidden sm:inline">Activities</span>
      </button>

      {/* Chat Sidebar Toggle */}
      <button
        onClick={toggleChat}
        className={`p-3 rounded-xl transition-all relative ${
          isChatOpen
            ? "bg-zinc-700 text-white"
            : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
        }`}
        title="Toggle Chat"
      >
        <MessageSquare size={20} />
      </button>

      <div className="w-[1px] h-6 bg-zinc-800 mx-1" />

      {/* Leave Room Button */}
      <button
        onClick={() => router.push("/")}
        className="p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all"
        title="Leave Room"
      >
        <PhoneOff size={20} />
      </button>
    </footer>
  );
}