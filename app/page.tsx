"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Film,
  Gamepad2,
  MessageSquare,
  Monitor,
  Sparkles,
  Users,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");

  const launch = () => router.push("/lobby");
  const join = (e: React.FormEvent) => {
    e.preventDefault();
    const id = roomCode.trim().replace(/^\/+|\/+$/g, "");
    if (!id) return launch();
    router.push(`/room/${encodeURIComponent(id)}`);
  };

  return (
    <div className="min-h-screen bg-[#160029] text-white selection:bg-[#ffe600] selection:text-black">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-fuchsia-600/10 blur-3xl" />
      </div>

      <header className="relative z-20 mx-auto w-full max-w-6xl px-4 pt-5 sm:px-8">
        <nav className="flex items-center justify-between rounded-2xl border border-purple-500/20 bg-[#2a074e]/80 px-4 py-3 shadow-2xl shadow-purple-950/40 backdrop-blur-md sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-2xl">🍿</span>
            <span className="text-xl font-extrabold tracking-wide text-[#ffe600]">
              Dhaba
            </span>
          </Link>
          <div className="hidden items-center gap-7 text-sm font-semibold text-purple-200 sm:flex">
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#how" className="transition hover:text-white">
              How it works
            </a>
            <a href="#contact" className="transition hover:text-white">
              Contact
            </a>
          </div>
          <button
            onClick={launch}
            className="rounded-full bg-[#ffe600] px-5 py-2 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-yellow-500/25 transition hover:bg-[#fff04b] sm:px-7"
          >
            Launch
          </button>
        </nav>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-8 lg:grid-cols-2 lg:py-20">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-200">
              <Sparkles size={14} className="text-[#ffe600]" />
              <span>Free virtual hangouts, right in your browser</span>
            </div>
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-[#fff6bd] sm:text-5xl lg:text-6xl">
              Watch parties
              <br />
              made easy
            </h1>
            <p className="mx-auto max-w-xl text-sm text-purple-200/85 sm:text-base lg:mx-0">
              Hang out with friends, stream videos on a shared cinema screen,
              chat in real time, and jump into a room with a link. No downloads.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <button
                onClick={launch}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ffe600] px-7 py-3.5 text-sm font-black uppercase tracking-wide text-black shadow-xl shadow-yellow-500/20 transition hover:bg-[#fff04b]"
              >
                Create a room
                <ArrowRight size={18} />
              </button>
              <form onSubmit={join} className="flex w-full max-w-sm gap-2">
                <input
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  placeholder="Enter room code"
                  className="min-w-0 flex-1 rounded-xl border border-purple-500/30 bg-[#22043f]/80 px-4 py-3 text-sm text-white placeholder-purple-300/45 outline-none focus:border-[#ffe600]/70"
                />
                <button
                  type="submit"
                  className="rounded-xl border border-purple-400/30 bg-[#2b0750] px-4 py-3 text-sm font-semibold text-purple-100 transition hover:bg-[#360965]"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          <button
            onClick={launch}
            className="group relative mx-auto w-full max-w-xl text-left"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border-2 border-purple-500/30 bg-[#120024] shadow-2xl shadow-purple-950/70">
              <div className="absolute inset-x-5 top-5 bottom-16 overflow-hidden rounded-2xl border border-purple-500/25 bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80"
                  alt=""
                  className="h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#160029]/60 to-transparent" />
                <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#ffe600] text-black shadow-xl">
                  <span className="ml-0.5 text-lg">▶</span>
                </div>
              </div>
              <div className="absolute bottom-0 inset-x-10 flex h-16 items-center justify-center gap-3 rounded-t-[28px] border-t-2 border-[#8c9406] bg-[#707604] px-4 shadow-xl">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5b32a8] text-xs font-bold ring-2 ring-white/90">
                  A
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold ring-2 ring-white/90">
                  B
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-600 text-xs font-bold ring-2 ring-white/90">
                  C
                </div>
              </div>
              <div className="absolute right-7 top-7 flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-[#1f003a]/90 px-2.5 py-1 text-[10px] text-purple-100 shadow-lg">
                <MessageSquare size={12} className="text-[#ffe600]" />
                <span>Ready for movie night?</span>
              </div>
            </div>
          </button>
        </section>

        <section
          id="features"
          className="border-y border-purple-500/15 bg-[#1d0338]/50"
        >
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8">
            <h2 className="text-center text-2xl font-black text-[#fff6bd] sm:text-3xl">
              Everything in one room
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-purple-200/75">
              A simple space for watching, chatting, and hanging out together.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Film,
                  title: "Shared watch screen",
                  text: "Put a video on the room screen so everyone watches together.",
                },
                {
                  icon: MessageSquare,
                  title: "Live chat",
                  text: "Talk in the room with a clean, fast chat sidebar.",
                },
                {
                  icon: Users,
                  title: "Easy invites",
                  text: "Create a room and share the link or room code with friends.",
                },
                {
                  icon: Monitor,
                  title: "Virtual room vibe",
                  text: "A cozy stage layout designed for hangouts, not meetings.",
                },
                {
                  icon: Gamepad2,
                  title: "Activities",
                  text: "Switch the room focus for watch parties and shared moments.",
                },
                {
                  icon: Sparkles,
                  title: "No hassle",
                  text: "Jump in from the browser with a nickname and start hanging out.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-purple-500/20 bg-[#240344]/70 p-5 shadow-lg shadow-purple-950/20"
                >
                  <f.icon className="mb-3 text-[#ffe600]" size={22} />
                  <h3 className="font-bold text-white">{f.title}</h3>
                  <p className="mt-1 text-sm text-purple-200/75">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl px-4 py-14 sm:px-8">
          <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-[#260547] to-[#1a0333] p-8 sm:p-10">
            <h2 className="text-2xl font-black text-[#fff6bd] sm:text-3xl">
              How it works
            </h2>
            <ol className="mt-6 grid gap-4 text-sm text-purple-100/90 sm:grid-cols-3">
              <li className="rounded-2xl bg-black/15 p-4">
                <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#ffe600] text-xs font-black text-black">
                  1
                </span>
                <p className="font-semibold text-white">Create a room</p>
                <p className="mt-1 text-purple-200/75">
                  Launch Dhaba and pick a nickname.
                </p>
              </li>
              <li className="rounded-2xl bg-black/15 p-4">
                <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#ffe600] text-xs font-black text-black">
                  2
                </span>
                <p className="font-semibold text-white">Share the link</p>
                <p className="mt-1 text-purple-200/75">
                  Send the room URL so friends can join instantly.
                </p>
              </li>
              <li className="rounded-2xl bg-black/15 p-4">
                <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#ffe600] text-xs font-black text-black">
                  3
                </span>
                <p className="font-semibold text-white">Watch & hang out</p>
                <p className="mt-1 text-purple-200/75">
                  Chat and stream media together on the shared screen.
                </p>
              </li>
            </ol>
            <div className="mt-8 text-center sm:text-left">
              <button
                onClick={launch}
                className="rounded-2xl bg-[#ffe600] px-7 py-3 text-sm font-black uppercase tracking-wide text-black transition hover:bg-[#fff04b]"
              >
                Launch Dhaba
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer
        id="contact"
        className="relative z-10 border-t border-purple-500/15 px-4 py-8 text-center text-sm text-purple-200/70 sm:px-8"
      >
        <p>
          Contact:{" "}
          <a
            className="text-[#ffe600] hover:underline"
            href="mailto:muzeefkokkinti@gmail.com"
          >
            muzeefkokkinti@gmail.com
          </a>
        </p>
        <p className="mt-2 text-xs text-purple-300/45">
          Dhaba — virtual watch parties & hangouts.
        </p>
      </footer>
    </div>
  );
}