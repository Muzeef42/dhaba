"use client";

import React from "react";
import {
  useTracks,
  VideoTrack,
  useParticipantInfo,
  useIsSpeaking,
  isTrackReference,
  useMaybeRoomContext,
} from "@livekit/components-react";
import type { TrackReferenceOrPlaceholder } from "@livekit/components-react";
import { Track } from "livekit-client";
import { MicOff, User } from "lucide-react";

function Placeholder({ message }: { message: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center p-4 text-center text-sm text-purple-200/70">
      {message}
    </div>
  );
}

export function VideoGrid() {
  const room = useMaybeRoomContext();
  if (!room) {
    return <Placeholder message="Camera/video tiles appear when LiveKit is connected." />;
  }
  return <LiveVideoGrid />;
}

function LiveVideoGrid() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  if (!tracks.length) {
    return <Placeholder message="Waiting for participants…" />;
  }

  const count = tracks.length;
  const cols =
    count <= 1
      ? "grid-cols-1"
      : count <= 2
        ? "grid-cols-1 sm:grid-cols-2"
        : count <= 4
          ? "grid-cols-2"
          : "grid-cols-2 md:grid-cols-3";

  return (
    <div className="h-full w-full overflow-auto p-2 sm:p-3">
      <div className={`grid ${cols} auto-rows-fr gap-2 sm:gap-3`}>
        {tracks.map((trackRef) => (
          <Tile
            key={`${trackRef.participant.identity}-${trackRef.source}-${trackRef.publication?.trackSid ?? "ph"}`}
            trackRef={trackRef}
          />
        ))}
      </div>
    </div>
  );
}

function Tile({ trackRef }: { trackRef: TrackReferenceOrPlaceholder }) {
  const participant = trackRef.participant;
  const { identity, name } = useParticipantInfo({ participant });
  const speaking = useIsSpeaking(participant);
  const active = isTrackReference(trackRef) && !trackRef.publication.isMuted;
  const display = name || identity || "Guest";

  return (
    <div
      className={`relative min-h-[140px] overflow-hidden rounded-2xl border bg-[#120024] shadow-lg transition sm:min-h-[160px] ${
        speaking
          ? "border-emerald-400/70 ring-2 ring-emerald-400/20"
          : "border-purple-700/30"
      }`}
    >
      {active ? (
        <VideoTrack
          trackRef={trackRef}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full min-h-[140px] flex-col items-center justify-center gap-2 bg-gradient-to-b from-[#2a074e] to-[#18002e] sm:min-h-[160px]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5b32a8] text-white shadow-inner">
            <User size={26} />
          </div>
          <span className="max-w-[90%] truncate text-xs font-medium text-purple-100">
            {display}
          </span>
        </div>
      )}
      <div className="absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] items-center gap-1.5 rounded-lg bg-black/55 px-2 py-1 text-[11px] text-white backdrop-blur-md">
        <span className="truncate">{display}</span>
        {participant.isMicrophoneEnabled === false && (
          <MicOff size={12} className="shrink-0 text-red-300" />
        )}
      </div>
    </div>
  );
}
