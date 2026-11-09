"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { LiveKitRoom } from "@livekit/components-react";
import { StageContainer } from "@/components/stage/stage-container";
import { ChatPanel } from "@/components/chat/chat-panel";
import { Bell, Check, Copy } from "lucide-react";

function RoomComponent() {
  const params = useParams();
  const searchParams = useSearchParams();

  const roomId = (params?.roomId as string) || "dhaba-room";
  const username = searchParams?.get("name") || "Guest";

  const [token, setToken] = useState("");
  const [wsUrl, setWsUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function getToken() {
      try {
        const res = await fetch(
          `/api/token?room=${encodeURIComponent(roomId)}&username=${encodeURIComponent(username)}`
        );
        const data = await res.json();
        if (isMounted && data.token) {
          setToken(data.token);
          setWsUrl(data.wsUrl);
        }
      } catch (err) {
        console.warn("Token note:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (roomId) {
      getToken();
    }

    return () => {
      isMounted = false;
    };
  }, [roomId, username]);

  const copyRoomLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#18002e] flex flex-col items-center justify-center text-white gap-3 font-sans">
        <div className="w-10 h-10 border-4 border-[#ffe600] border-t-transparent rounded-full animate-spin" />
        <p className="text-purple-200 text-sm font-medium">Entering Dhaba Room...</p>
      </div>
    );
  }

  const isRealServer = Boolean(wsUrl && !wsUrl.includes("demo.livekit.cloud"));

  return (
    <LiveKitRoom
      token={token}
      serverUrl={wsUrl}
      connect={isRealServer}
      video={false}
      audio={false}
      onError={(err) => console.warn("LiveKit notice:", err)}
      className="h-screen w-screen flex flex-col overflow-hidden font-sans select-none bg-[#1e0238]"
    >
      <header className="h-12 border-b border-purple-900/40 px-4 flex items-center justify-between z-30 bg-[#160029]">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="w-8 h-8 rounded-full bg-[#ffe600] flex items-center justify-center text-sm shadow cursor-pointer"
          >
            🍿
          </a>
          <button className="text-purple-300 hover:text-white p-1">
            <Bell size={17} />
          </button>
        </div>

        <div className="bg-[#2d0554] border border-purple-700/30 px-3.5 py-1 rounded-full flex items-center gap-2 text-xs text-purple-100 font-semibold shadow-sm">
          <span>🍿</span>
          <span className="capitalize">{roomId}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={copyRoomLink}
            className="flex items-center gap-1.5 hover:bg-[#fff04b] text-black px-3 py-1 rounded-full text-xs font-bold transition shadow cursor-pointer bg-[#ffe600]"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? "Copied!" : "Share"}</span>
          </button>

          <div className="w-7 h-7 rounded-full bg-[#5b32a8] text-white flex items-center justify-center text-xs font-bold border border-purple-400/40">
            {username.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <StageContainer />
        <ChatPanel />
      </div>
    </LiveKitRoom>
  );
}

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-[#18002e] flex flex-col items-center justify-center text-white gap-3 font-sans">
          <div className="w-10 h-10 border-4 border-[#ffe600] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RoomComponent />
    </Suspense>
  );
}
