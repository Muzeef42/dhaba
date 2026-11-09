"use client";

import { useEffect, useRef, useCallback } from "react";

export interface SyncEventPayload {
  type: "YOUTUBE_CHANGE" | "YOUTUBE_PLAY" | "YOUTUBE_PAUSE" | "YOUTUBE_SEEK";
  videoId?: string;
  timestamp?: number;
  sender: string;
}

export function useRoomSync(
  roomId: string,
  onSyncEvent: (payload: SyncEventPayload) => void
) {
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !roomId) return;

    try {
      const channelName = `dhaba_sync_${roomId}`;
      const bc = new BroadcastChannel(channelName);
      broadcastChannelRef.current = bc;

      bc.onmessage = (event) => {
        if (event.data && event.data.type) {
          onSyncEvent(event.data);
        }
      };

      return () => {
        bc.close();
        broadcastChannelRef.current = null;
      };
    } catch (err) {
      console.warn("BroadcastChannel not supported:", err);
    }
  }, [roomId, onSyncEvent]);

  const broadcastSync = useCallback((payload: SyncEventPayload) => {
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage(payload);
    }
  }, []);

  return { broadcastSync };
}