"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { MessageSquare, Users, Share2, Check, Send, Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useParticipants, useTrackToggle } from "@livekit/components-react";
import { Track } from "livekit-client";

type Msg = { id: string; sender: string; text: string; self?: boolean };
type ApiMsg = {
  _id?: string;
  id?: string;
  senderName?: string;
  message?: string;
  createdAt?: string;
};

function ParticipantsTab({ me }: { me: string }) {
  const participants = useParticipants();
  const names = participants
    .map((p) => p.name || p.identity)
    .filter((n): n is string => Boolean(n));
  const people = names.length ? Array.from(new Set(names)) : [me];

  return (
    <div className="space-y-2">
      {people.map((name) => (
        <div
          key={name}
          className="flex items-center gap-2 rounded-xl bg-[#240344] p-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5b32a8] text-xs font-bold text-white">
            {name.charAt(0).toUpperCase()}
          </div>
          <span className="truncate text-xs font-medium text-white">
            {name}
            {name === me ? " (You)" : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

function DemoParticipantsTab({ me }: { me: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-xl bg-[#240344] p-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5b32a8] text-xs font-bold text-white">
          {me.charAt(0).toUpperCase()}
        </div>
        <span className="truncate text-xs font-medium text-white">{me} (You)</span>
      </div>
      <p className="px-1 text-[11px] text-purple-300/60">
        Live participant list appears when LiveKit is connected.
      </p>
    </div>
  );
}

export function ChatPanel({
  demoMode = false,
  me: meProp,
}: {
  demoMode?: boolean;
  me?: string;
}) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = (params?.roomId as string) || "room";
  const me = meProp || searchParams?.get("name") || "Guest";

  const [tab, setTab] = useState<"chat" | "people">("chat");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const mic = useTrackToggle({ source: Track.Source.Microphone });
  const cam = useTrackToggle({ source: Track.Source.Camera });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/messages?room=${encodeURIComponent(roomId)}`);
        if (!res.ok) return;
        const data = (await res.json()) as { messages?: ApiMsg[] };
        const list = Array.isArray(data?.messages) ? data.messages : [];
        if (cancelled) return;
        setMessages(
          list.map((m) => ({
            id: m._id || m.id || `${m.createdAt}-${m.senderName}`,
            sender: m.senderName || "Guest",
            text: m.message || "",
            self: m.senderName === me,
          }))
        );
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [roomId, me]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tab]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    const optimistic: Msg = {
      id: `local-${Date.now()}`,
      sender: me,
      text: body,
      self: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setText("");
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          senderName: me,
          senderId: me,
          message: body,
        }),
      });
    } catch {}
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <aside className="flex h-full w-[19rem] shrink-0 flex-col border-l border-purple-900/40 bg-[#18002e] sm:w-80">
      <div className="border-b border-purple-900/30 p-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🍿</span>
          <span className="text-xs font-extrabold tracking-wide text-[#ffe600]">Dhaba</span>
        </div>
        {confirmLeave ? (
          <div className="mt-2 bg-[#2d0554] border border-red-500/40 rounded-xl p-3 shadow-2xl shadow-red-900/20">
            <p className="text-xs text-red-200 mb-2">Leave this room?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmLeave(false)}
                className="flex-1 px-2.5 py-2 rounded-lg border border-purple-500/40 text-xs font-medium text-purple-300 bg-[#240344] hover:bg-[#380a66] transition"
              >
                Cancel
              </button>
              <button
                onClick={() => router.push("/lobby")}
                className="flex-1 px-2.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition"
              >
                Leave
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmLeave(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-[#2d0554]/50 px-3 py-2.5 text-xs font-medium text-red-300 transition hover:bg-red-500/20 hover:text-white"
            title="Leave room"
          >
            <PhoneOff size={14} />
            <span>Leave room</span>
          </button>
        )}
        <button
          onClick={copyInvite}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/20 bg-[#300757] px-3 py-2.5 text-xs font-medium text-purple-100 transition hover:bg-[#3e0a6e]"
        >
          {copied ? (
            <Check size={14} className="text-emerald-400" />
          ) : (
            <Share2 size={14} />
          )}
          <span>{copied ? "Invite link copied" : "Invite friends"}</span>
        </button>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => mic.toggle()}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition ${
              mic.enabled
                ? "border-purple-500/50 bg-[#2d0554] text-white"
                : "border-purple-500/30 bg-[#240344] text-purple-300 hover:bg-[#380a66]"
            }`}
            title={mic.enabled ? "Mute mic" : "Unmute mic"}
          >
            {mic.enabled ? <Mic size={13} className="text-red-300" /> : <MicOff size={13} className="text-purple-300" />}
            <span>{mic.enabled ? "Mic On" : "Mic Off"}</span>
          </button>
          <button
            onClick={() => cam.toggle()}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition ${
              cam.enabled
                ? "border-purple-500/50 bg-[#2d0554] text-white"
                : "border-purple-500/30 bg-[#240344] text-purple-300 hover:bg-[#380a66]"
            }`}
            title={cam.enabled ? "Turn off camera" : "Turn on camera"}
          >
            {cam.enabled ? <Video size={13} className="text-red-300" /> : <VideoOff size={13} className="text-purple-300" />}
            <span>{cam.enabled ? "Video On" : "Video Off"}</span>
          </button>
        </div>
      </div>

      <div className="flex border-b border-purple-900/30 text-xs">
        <button
          onClick={() => setTab("chat")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 ${
            tab === "chat"
              ? "border-b-2 border-purple-300 font-bold text-white"
              : "text-purple-400 hover:text-white"
          }`}
        >
          <MessageSquare size={15} />
          <span>Chat</span>
        </button>
        <button
          onClick={() => setTab("people")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 ${
            tab === "people"
              ? "border-b-2 border-purple-300 font-bold text-white"
              : "text-purple-400 hover:text-white"
          }`}
        >
          <Users size={15} />
          <span>People</span>
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {tab === "chat" ? (
          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="rounded-2xl bg-[#240344]/60 px-3 py-2 text-xs text-purple-200/80">
                Welcome to <span className="font-semibold text-white">{roomId}</span>.
                Share the invite link to bring friends in.
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.self ? "items-end" : "items-start"}`}
              >
                <span className="mb-0.5 px-1 text-[10px] text-purple-400/60">
                  {m.sender}
                </span>
                <div
                  className={`max-w-[88%] break-words rounded-2xl px-3 py-2 text-xs shadow-sm ${
                    m.self
                      ? "rounded-br-none bg-[#ffe600] font-semibold text-black"
                      : "rounded-bl-none bg-[#29054d] text-purple-100"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
        ) : demoMode ? (
          <DemoParticipantsTab me={me} />
        ) : (
          <ParticipantsTab me={me} />
        )}
      </div>

      <form
        onSubmit={send}
        className="flex items-center gap-2 border-t border-purple-900/30 bg-[#20023d] p-2.5"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Send a message…"
          className="min-w-0 flex-1 bg-transparent px-2 py-1 text-sm text-white placeholder-purple-400/45 outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="rounded-lg p-1.5 text-[#ffe600] transition hover:bg-white/5 disabled:opacity-35"
          title="Send"
        >
          <Send size={16} />
        </button>
      </form>
    </aside>
  );
}
