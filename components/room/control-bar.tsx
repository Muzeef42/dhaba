"use client";

import React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MonitorOff,
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

  const mic = useTrackToggle({ source: Track.Source.Microphone });
  const cam = useTrackToggle({ source: Track.Source.Camera });
  const screen = useTrackToggle({ source: Track.Source.ScreenShare });

  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-3 sm:bottom-6">
      <div className="pointer-events-auto flex items-center gap-1.5 rounded-2xl border border-purple-500/25 bg-[#1f003a]/90 p-2 shadow-2xl shadow-purple-950/60 backdrop-blur-md sm:gap-2 sm:px-3">
        <button
          onClick={() => mic.toggle()}
          className={`rounded-xl p-2.5 transition sm:p-3 ${
            mic.enabled
              ? "bg-[#2d0554] text-white hover:bg-[#380a66]"
              : "bg-red-500/20 text-red-300 hover:bg-red-500/30"
          }`}
          title={mic.enabled ? "Mute microphone" : "Unmute microphone"}
        >
          {mic.enabled ? <Mic size={19} /> : <MicOff size={19} />}
        </button>

        <button
          onClick={() => cam.toggle()}
          className={`rounded-xl p-2.5 transition sm:p-3 ${
            cam.enabled
              ? "bg-[#2d0554] text-white hover:bg-[#380a66]"
              : "bg-red-500/20 text-red-300 hover:bg-red-500/30"
          }`}
          title={cam.enabled ? "Turn off camera" : "Turn on camera"}
        >
          {cam.enabled ? <Video size={19} /> : <VideoOff size={19} />}
        </button>

        <button
          onClick={() => screen.toggle()}
          className={`rounded-xl p-2.5 transition sm:p-3 ${
            screen.enabled
              ? "bg-blue-600 text-white"
              : "bg-[#2d0554] text-purple-100 hover:bg-[#380a66]"
          }`}
          title={screen.enabled ? "Stop sharing" : "Share screen"}
        >
          {screen.enabled ? <MonitorOff size={19} /> : <MonitorUp size={19} />}
        </button>

        <div className="mx-0.5 h-6 w-px bg-purple-500/25" />

        <button
          onClick={() =>
            setActiveActivity(activeActivity === "youtube" ? "grid" : "youtube")
          }
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2.5 text-xs font-semibold transition sm:px-3 ${
            activeActivity === "youtube"
              ? "bg-[#ffe600] text-black"
              : "bg-[#2d0554] text-purple-100 hover:bg-[#380a66]"
          }`}
          title="Toggle watch party"
        >
          <Gamepad2 size={18} />
          <span className="hidden sm:inline">Watch</span>
        </button>

        <button
          onClick={toggleChat}
          className={`rounded-xl p-2.5 transition sm:p-3 ${
            isChatOpen
              ? "bg-[#2d0554] text-white"
              : "bg-[#2d0554]/60 text-purple-200 hover:bg-[#380a66]"
          }`}
          title="Toggle chat"
        >
          <MessageSquare size={19} />
        </button>

        <div className="mx-0.5 h-6 w-px bg-purple-500/25" />

        <button
          onClick={() => router.push("/lobby")}
          className="rounded-xl bg-red-600 p-2.5 text-white transition hover:bg-red-500 sm:p-3"
          title="Leave room"
        >
          <PhoneOff size={19} />
        </button>
      </div>
    </footer>
  );
}
