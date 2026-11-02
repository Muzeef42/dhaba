"use client";

import React from "react";
import {
  useTracks,
  VideoTrack,
  AudioTrack,
  useParticipantInfo,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { User, MicOff } from "lucide-react";

export function VideoGrid() {
  // Listen to all camera and screen-share tracks from everyone in the room
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  return (
    <div className="flex-1 w-full h-full p-4 overflow-hidden flex items-center justify-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full h-full max-h-[85vh]">
        {tracks.map((trackRef) => (
          <ParticipantTile key={trackRef.participant.identity} trackRef={trackRef} />
        ))}
      </div>
    </div>
  );
}

function ParticipantTile({ trackRef }: { trackRef: any }) {
  const { identity, name, isSpeaking } = useParticipantInfo({
    participant: trackRef.participant,
  });

  const isVideoOff = !trackRef.publication?.isSubscribed && !trackRef.publication?.track;

  return (
    <div
      className={`relative w-full h-full bg-zinc-900 border rounded-2xl overflow-hidden flex items-center justify-center shadow-lg transition-all ${
        isSpeaking ? "border-green-500 ring-2 ring-green-500/20" : "border-zinc-800"
      }`}
    >
      {/* Video stream */}
      {trackRef.publication?.track ? (
        <VideoTrack trackRef={trackRef} className="w-full h-full object-cover" />
      ) : (
        /* Fallback avatar if camera is off */
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
            <User size={32} />
          </div>
          <span className="text-zinc-400 text-sm font-medium">
            {name || identity}
          </span>
        </div>
      )}

      {/* Participant Audio */}
      {trackRef.source === Track.Source.Camera && (
        <AudioTrack trackRef={trackRef} />
      )}

      {/* Name tag overlay */}
      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-2 text-xs text-white">
        <span>{name || identity}</span>
        {trackRef.participant.isMuted && (
          <MicOff size={12} className="text-red-400" />
        )}
      </div>
    </div>
  );
}