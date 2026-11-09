"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Link2, Sparkles, Users } from "lucide-react";

export default function LobbyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [suggested, setSuggested] = useState("dhaba-party");

  // Client-safe generation: Runs only on the browser, fixing the Next.js 16 prerender error!
  useEffect(() => {
    const randomCode = `dhaba-${Date.now().toString(36).slice(-6)}`;
    setSuggested(randomCode);
  }, []);

  const createRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const display = name.trim() || "Friend";
    router.push(`/room/${suggested}?name=${encodeURIComponent(display)}`);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const id = joinCode.trim().replace(/^\/+|\/+$/g, "");
    if (!id) return;
    const display = name.trim() || "Friend";
    router.push(`/room/${encodeURIComponent(id)}?name=${encodeURIComponent(display)}`);
  };

  return (
    <div className="min-h-screen bg-[#160029] text-white select-none">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-purple-900/30 bg-[#1c0235]/60 px-4 py-4 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-2xl">🍿</span>
            <span className="text-xl font-extrabold tracking-wide text-[#ffe600]">
              Dhaba
            </span>
          </button>
          <button
            onClick={() => router.push("/")}
            className="text-sm font-semibold text-purple-200 hover:text-white cursor-pointer"
          >
            Back
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-8 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-3xl border border-purple-500/20 bg-[#240344]/75 p-6 shadow-2xl shadow-purple-950/30 sm:p-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/25 bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-200">
            <Sparkles size={14} className="text-[#ffe600]" />
            <span>Start a watch party in seconds</span>
          </div>
          <h1 className="text-3xl font-black text-[#fff6bd]">Create a room</h1>
          <p className="mt-2 max-w-lg text-sm text-purple-200/80">
            Pick a name, create a room, and share the link. Friends can join from
            the same page with the room code.
          </p>

          <form onSubmit={createRoom} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-purple-200">
                Your nickname
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Muzeef"
                className="w-full rounded-xl border border-purple-500/30 bg-[#160029] px-4 py-3 text-sm text-white placeholder-purple-300/40 outline-none focus:border-[#ffe600]/70"
              />
            </div>
            <div className="rounded-xl border border-purple-500/20 bg-[#160029]/70 px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-purple-300/70">
                Room code
              </div>
              <div className="mt-1 min-h-5 font-mono text-sm text-[#ffe600]">
                {suggested}
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ffe600] px-6 py-3.5 text-sm font-black uppercase tracking-wide text-black transition hover:bg-[#fff04b] cursor-pointer"
            >
              Create & enter room
              <ArrowRight size={18} />
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-purple-500/20 bg-[#240344]/75 p-6 shadow-xl sm:p-7">
            <div className="flex items-center gap-2 text-white">
              <Link2 size={18} className="text-[#ffe600]" />
              <h2 className="text-lg font-bold">Join a room</h2>
            </div>
            <p className="mt-1 text-sm text-purple-200/75">
              Paste a room code or room ID shared by a friend.
            </p>
            <form onSubmit={joinRoom} className="mt-4 space-y-3">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="dhaba-abc123 or room ID"
                className="w-full rounded-xl border border-purple-500/30 bg-[#160029] px-4 py-3 text-sm text-white placeholder-purple-300/40 outline-none focus:border-[#ffe600]/70"
              />
              <button
                type="submit"
                className="w-full rounded-xl border border-purple-400/30 bg-[#2b0750] px-4 py-3 text-sm font-bold text-purple-50 transition hover:bg-[#360965] cursor-pointer"
              >
                Join room
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-purple-500/15 bg-[#1d0338]/60 p-6">
            <div className="flex items-center gap-2 text-white">
              <Users size={18} className="text-[#ffe600]" />
              <h3 className="font-bold">What you get</h3>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-purple-200/80">
              <li>• Shared cinema screen for watch parties</li>
              <li>• Room chat and presence-ready layout</li>
              <li>• Simple invite by link or code</li>
              <li>• LiveKit-powered media when configured</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}