"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Share2, X, ArrowRight, Check, Wifi, WifiOff, Users, Clock, Film } from "lucide-react";
import { io } from "socket.io-client";

export function NetflixSyncModal({
  roomId,
  username,
  onClose,
  onConnectionChange,
}: {
  roomId: string;
  username: string;
  onClose: () => void;
  onConnectionChange?: (connected: boolean) => void;
}) {
  const [step, setStep] = useState<"launch" | "share">("launch");
  const [isLaunched, setIsLaunched] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Array<{ id: string; username: string; isWatching: boolean; videoId: string | null }>>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const socketRef = useRef<any>(null);

  const SERVER_URL = "http://localhost:4000";

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      onConnectionChange?.(true);
      socket.emit("join-room", { roomId, username });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      onConnectionChange?.(false);
    });

    socket.on("room-state", (state: any) => {
      setParticipants(state.participants || []);
      setCurrentVideoId(state.videoId || null);
      setCurrentVideoTitle(state.videoTitle || null);
      setIsPlaying(state.isPlaying || false);
      setCurrentTime(state.currentTime || 0);
    });

    socket.on("participant-joined", (p: any) => {
      setParticipants((prev) => [...prev.filter((x) => x.id !== p.id), p]);
    });

    socket.on("participant-left", (id: string) => {
      setParticipants((prev) => prev.filter((x) => x.id !== id));
    });

    socket.on("participant-updated", (p: any) => {
      setParticipants((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, ...p } : x))
      );
    });

    socket.on("video-synced", (data: any) => {
      if (data.senderId === socket.id) return;
      setCurrentVideoId(data.videoId || null);
      setCurrentVideoTitle(data.videoTitle || null);
      setIsPlaying(data.isPlaying || false);
      setCurrentTime(data.currentTime || 0);
      setParticipants((prev) =>
        prev.map((x) =>
          x.id === data.senderId
            ? { ...x, isWatching: true, videoId: data.videoId || null }
            : x
        )
      );
    });

    socket.on("video-play", (data: any) => {
      if (data.senderId === socket.id) return;
      setIsPlaying(true);
      setCurrentTime(data.currentTime || 0);
      setParticipants((prev) =>
        prev.map((x) =>
          x.id === data.senderId
            ? { ...x, isWatching: true, videoId: data.videoId || null }
            : x
        )
      );
    });

    socket.on("video-pause", (data: any) => {
      if (data.senderId === socket.id) return;
      setIsPlaying(false);
      setCurrentTime(data.currentTime || 0);
      setParticipants((prev) =>
        prev.map((x) =>
          x.id === data.senderId
            ? { ...x, isWatching: true, videoId: data.videoId || null }
            : x
        )
      );
    });

    socket.on("video-seek", (data: any) => {
      if (data.senderId === socket.id) return;
      setCurrentTime(data.currentTime || 0);
      setParticipants((prev) =>
        prev.map((x) =>
          x.id === data.senderId
            ? { ...x, isWatching: true, videoId: data.videoId || null }
            : x
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, username]);

  const handleLaunchNetflix = () => {
    const netflixUrl = "https://www.netflix.com/browse/";
    window.open(netflixUrl, "_blank");
    setIsLaunched(true);
    setStep("share");
  };

  const handleJoinSameTitle = () => {
    if (!currentVideoId) return;
    const netflixUrl = `https://www.netflix.com/watch/${currentVideoId}`;
    window.open(netflixUrl, "_blank");
  };

  const handleSyncVideo = () => {
    if (!socketRef.current) return;
    socketRef.current.emit("sync-video", {
      roomId,
      videoId: currentVideoId,
      videoTitle: currentVideoTitle,
      isPlaying,
      currentTime,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#240344] border border-purple-500/40 rounded-3xl w-full max-w-2xl h-[85vh] max-h-[700px] shadow-2xl flex flex-col overflow-hidden relative font-sans">
        <div className="p-4 sm:p-5 border-b border-purple-900/40 flex items-center justify-between bg-[#1f023a]">
          <div className="flex items-center gap-2">
            <Film size={20} className="text-[#ffe600]" />
            <h3 className="text-lg font-black text-white">Watch Netflix Together</h3>
          </div>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white p-1 rounded-xl hover:bg-purple-900/50 transition cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6 text-xs font-semibold text-purple-400/70">
            <div
              className={`px-3 py-1 rounded-full ${
                step === "launch"
                  ? "bg-[#ffe600] text-black font-black"
                  : "bg-purple-900/50 border border-purple-500/30"
              }`}
            >
              1. Launch
            </div>
            <div className="w-px h-2 bg-purple-500/30 mx-1" />
            <div
              className={`px-3 py-1 rounded-full ${
                step === "share"
                  ? "bg-[#ffe600] text-black font-black"
                  : "bg-purple-900/50 border border-purple-500/30"
              }`}
            >
              2. Share
            </div>
          </div>

          {/* STEP 1: LAUNCH */}
          {step === "launch" && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 rounded-full bg-[#5b32a8] border-3 border-purple-400/40 flex items-center justify-center mb-6 shadow-2xl">
                <Play size={32} className="text-[#ffe600] ml-1" />
              </div>

              <h2 className="text-2xl font-black text-white mb-2">Launch Netflix</h2>
              <p className="text-purple-300/80 text-sm mb-8 max-w-md">
                Open Netflix in a new tab. Each person logs in with their own account — we never collect or store Netflix credentials.
              </p>

              <button
                onClick={handleLaunchNetflix}
                className="w-full max-w-xs bg-[#ffe600] hover:bg-[#fff04b] text-black font-extrabold py-4 rounded-xl text-xs uppercase tracking-wider transition shadow-xl shadow-yellow-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play size={16} className="fill-black" />
                <span>Launch Netflix</span>
              </button>

              <p className="mt-6 text-[11px] text-purple-400/60">
                Once Netflix is open, move to "Share" to sync playback with the room.
              </p>
            </div>
          )}

          {/* STEP 2: SHARE */}
          {step === "share" && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-white">Share & Sync</h2>
                  <p className="text-purple-300/80 text-sm">
                    Share this room so friends can join the same Netflix title.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-[#2d0554]/50">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-500/40"}`} />
                  <span className={`text-[10px] font-bold ${isConnected ? "text-emerald-400" : "text-red-400"}`}>
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>

              {/* Room ID display */}
              <div className="mb-6 bg-[#1e0238] border border-purple-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400/70">Room Code</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + "/room/" + roomId);
                    }}
                    className="text-purple-400 hover:text-[#ffe600] text-[10px] font-medium"
                  >
                    Copy
                  </button>
                </div>
                <div className="font-mono text-xl font-black text-[#ffe600] tracking-wider bg-black/40 px-3 py-2 rounded-lg border border-purple-500/20">
                  {roomId}
                </div>
              </div>

              {/* Participants */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">In the Room</h3>
                  <span className="text-[10px] font-bold text-purple-400">{participants.length}</span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {participants.length === 0 ? (
                    <div className="text-[11px] text-purple-400/60 text-center py-4">
                      Just you for now. Share the room code above.
                    </div>
                  ) : (
                    participants.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#1e0238] border border-purple-500/20 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#5b32a8] text-[10px] font-bold text-white">
                            {p.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-white">{p.username}</span>
                          {p.videoId && (
                            <span className="text-[9px] text-purple-400/70 font-medium">
                              {p.isWatching ? "Watching" : "Idle"}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {p.videoId === currentVideoId && p.isWatching && (
                            <Check size={10} className="text-emerald-400" />
                          )}
                          {p.videoId === currentVideoId && !p.isWatching && (
                            <Clock size={10} className="text-purple-400" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Current sync status */}
              <div className="mb-6 bg-[#1e0238] border border-purple-500/30 rounded-xl p-4">
                <h3 className="text-sm font-bold text-white mb-2">Current Sync</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-purple-400/70">Title</span>
                    <span className="text-white">{currentVideoTitle || currentVideoId || "None"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-400/70">Status</span>
                    <span className="text-white font-medium">{isPlaying ? "Playing" : "Paused"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-400/70">Time</span>
                    <span className="text-white font-mono">{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, "0")}</span>
                  </div>
                </div>
              </div>

              {/* Join same title button */}
              {currentVideoId && (
                <div className="mt-auto pt-6">
                  <button
                    onClick={handleJoinSameTitle}
                    disabled={!isConnected}
                    className={`w-full bg-[#2d0554] hover:bg-[#380a66] border border-purple-500/40 text-purple-200 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    <Users size={14} />
                    <span>Join the same title on Netflix</span>
                  </button>
                  <p className="mt-2 text-[10px] text-purple-400/60 text-center">
                    Opens Netflix in a new tab with the same video ID.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
