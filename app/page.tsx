"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Video, Users, Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRoom = roomId.trim() || `dhaba-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalName = username.trim() || `Friend_${Math.floor(100 + Math.random() * 900)}`;

    router.push(`/room/${encodeURIComponent(finalRoom)}?name=${encodeURIComponent(finalName)}`);
  };

  const handleQuickRoom = () => {
    const randomRoom = `dhaba-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalName = username.trim() || `Friend_${Math.floor(100 + Math.random() * 900)}`;
    router.push(`/room/${randomRoom}?name=${encodeURIComponent(finalName)}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Top Navbar */}
      <nav className="border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-black text-lg shadow-lg shadow-orange-500/10">
            D
          </div>
          <span className="font-bold text-xl tracking-tight">Dhaba</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Virtual Hangout Space</span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-xl mx-auto px-6 py-12 w-full flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-6">
          <Sparkles size={14} />
          <span>Hangout, stream & watch together</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
          Your virtual space to chill with friends.
        </h1>

        <p className="text-zinc-400 text-sm sm:text-base mb-8 max-w-md">
          Crystal-clear video calls, synchronized watch parties, and real-time chat. No sign-up required.
        </p>

        {/* Join / Create Form Card */}
        <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleJoin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Your Nickname
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Muzee"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Room Name (Optional)
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g. chai-pe-charcha"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold rounded-xl py-3 text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition cursor-pointer"
            >
              <span>Enter Room</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-zinc-900 px-2 text-zinc-500">or</span>
            </div>
          </div>

          <button
            onClick={handleQuickRoom}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-xl py-2.5 text-xs transition border border-zinc-700/60"
          >
            Create Instant Random Room
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-600">
        Dhaba • Built with Next.js, LiveKit & WebRTC
      </footer>
    </div>
  );
}