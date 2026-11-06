"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@livekit/components-react";
import { useRoomStore } from "@/stores/use-room-store";
import { useParams, useSearchParams } from "next/navigation";
import { Send, X, MessageSquare, Database } from "lucide-react";

interface DBMessage {
  _id?: string;
  senderName: string;
  senderId: string;
  message: string;
  createdAt?: string;
}

export function ChatPanel() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = (params?.roomId as string) || "dhaba-room";
  const currentUsername = searchParams.get("name") || "Guest";

  const { isChatOpen, toggleChat } = useRoomStore();
  const { chatMessages, send } = useChat();

  const [dbHistory, setDbHistory] = useState<DBMessage[]>([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch previous chat history from MongoDB on room load
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`/api/messages?room=${encodeURIComponent(roomId)}`);
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setDbHistory(data.messages);
        }
      } catch (err) {
        console.log("Could not load DB chat history:", err);
      }
    }

    if (roomId) {
      fetchHistory();
    }
  }, [roomId]);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, dbHistory]);

  // 2. Send message: broadcasts live over WebRTC AND saves to MongoDB
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const textToSend = message.trim();
    setMessage("");

    // Broadcast live over WebRTC
    send(textToSend);

    // Save permanently to MongoDB in background
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          senderName: currentUsername,
          senderId: currentUsername,
          message: textToSend,
        }),
      });
    } catch (err) {
      console.error("Failed to save to MongoDB", err);
    }
  };

  if (!isChatOpen) return null;

  return (
    <aside className="w-80 h-full bg-[#1c0235] border-l border-purple-900/40 flex flex-col z-30 font-sans shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-purple-900/30 flex items-center justify-between bg-[#240344]/50">
        <div className="flex items-center gap-2">
          <MessageSquare size={17} className="text-[#ffe600]" />
          <h2 className="font-bold text-white text-sm">Room Chat</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-purple-300/80 bg-purple-950/80 px-2 py-0.5 rounded-full flex items-center gap-1 border border-purple-800/40">
            <Database size={10} className="text-emerald-400" />
            MongoDB
          </span>
          <button
            onClick={toggleChat}
            className="text-purple-300 hover:text-white p-1 rounded-lg hover:bg-purple-900/40"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Render Saved History from MongoDB */}
        {dbHistory.map((msg, i) => {
          const isSelf = msg.senderName === currentUsername;
          return (
            <div key={`db-${i}`} className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
              <span className="text-[10px] text-purple-300/60 mb-0.5 px-1">{msg.senderName}</span>
              <div
                className={`px-3 py-2 rounded-2xl max-w-[85%] text-xs break-words shadow-md ${
                  isSelf
                    ? "bg-[#ffe600] text-black font-medium rounded-br-none"
                    : "bg-[#2c0952] text-purple-100 rounded-bl-none border border-purple-700/30"
                }`}
              >
                {msg.message}
              </div>
            </div>
          );
        })}

        {/* Render Live Messages (current session) */}
        {chatMessages.map((msg, index) => {
          const isSelf = msg.from?.isLocal;
          return (
            <div key={`live-${index}`} className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
              <span className="text-[10px] text-purple-300/60 mb-0.5 px-1">
                {msg.from?.name || "Friend"}
              </span>
              <div
                className={`px-3 py-2 rounded-2xl max-w-[85%] text-xs break-words shadow-md ${
                  isSelf
                    ? "bg-[#ffe600] text-black font-medium rounded-br-none"
                    : "bg-[#2c0952] text-purple-100 rounded-bl-none border border-purple-700/30"
                }`}
              >
                {msg.message}
              </div>
            </div>
          );
        })}

        {dbHistory.length === 0 && chatMessages.length === 0 && (
          <p className="text-xs text-purple-300/40 text-center mt-12">
            No messages yet. Start the conversation! 👋
          </p>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 border-t border-purple-900/40 flex gap-2 bg-[#22033f]/40">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send a message..."
          className="flex-1 bg-[#140026] border border-purple-800/40 rounded-xl px-3 py-2 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:border-[#ffe600] transition"
        />
        <button
          type="submit"
          className="p-2 bg-[#ffe600] hover:bg-[#fff04b] text-black rounded-xl transition cursor-pointer"
        >
          <Send size={15} />
        </button>
      </form>
    </aside>
  );
}