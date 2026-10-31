 "use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { LiveKitRoom } from "@livekit/components-react";
import { StageContainer } from "@/components/stage/stage-container";
import { ChatPanel } from "@/components/chat/chat-panel";
import { ControlBar } from "@/components/room/control-bar";
import { Copy, Check, Users } from "lucide-react";

function RoomContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  const roomId = (params?.roomId as string) || "dhaba-room";
  const username = searchParams.get("name") || `Friend_${Math.floor(100 + Math.random() * 900)}`;

  const [token, setToken] = useState("");
  const [wsUrl, setWsUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getToken() {
      try {
        const res = await fetch(`/api/token?room=${encodeURIComponent(roomId)}&username=${encodeURIComponent(username)}`);
        const data = await res.json();
        if (data.token) {
          setToken(data.token);
          setWsUrl(data.wsUrl);
        }
      } catch (err) {
        console.error("Token error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (roomId) {
      getToken();
    }
  }, [roomId, username]);

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#18002e] flex flex-col items-center justify-center text-white gap-3 font-sans">
        <div className="w-10 h-10 border-3 border-[#ffe600] border-t-transparent rounded-full animate-spin" />
        <p className="text-purple-200 text-sm font-medium">Entering Dhaba Room...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={wsUrl}
      connect={Boolean(token && wsUrl)}
      video={false}
      audio={false}
      className="h-screen w-screen flex flex-col bg-[#140026] overflow-hidden font-sans select-none"
    >
      {/* Top Header Bar */}
      <header className="h-14 border-b border-purple-900/40 px-5 flex items-center justify-between bg-[#22033f]/70 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#ffe600] flex items-center justify-center font-black text-black text-xs shadow-md">
            🪐
          </div>
          <div>
            <h1 className="text-white text-sm font-bold capitalize">
              Room: {roomId}
            </h1>
            <p className="text-purple-300 text-[11px] flex items-center gap-1">
              <Users size={12} className="text-[#ffe600]" />
              <span>Joined as {username}</span>
            </p>
          </div>
        </div>

        {/* Copy Invite Link */}
        <button
          onClick={copyRoomLink}
          className="flex items-center gap-2 bg-[#ffe600] hover:bg-[#fff04b] text-black px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-md cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={14} className="text-black" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Share Room</span>
            </>
          )}
        </button>
      </header>

      {/* Main Stage + Chat */}
      <div className="flex-1 flex overflow-hidden relative">
        <StageContainer />
        <ChatPanel />
      </div>

      {/* Bottom Dock */}
      <ControlBar />
    </LiveKitRoom>
  );
}

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-[#18002e] flex items-center justify-center text-white">
          <div className="w-10 h-10 border-3 border-[#ffe600] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RoomContent />
    </Suspense>
  );
}