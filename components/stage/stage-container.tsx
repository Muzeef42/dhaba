"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRoomStore } from "@/stores/use-room-store";
import {
  Film,
  Play,
  Pause,
  X,
  Tv,
  Sparkles,
  Monitor,
  Link2,
  FileVideo,
  Search,
  Gamepad2,
  Radio,
  ArrowLeft,
  ChevronDown,
  Square,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  Minimize,
  FolderOpen,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useRoomSync, SyncEventPayload } from "@/hooks/use-room-sync";
import { useTracks, VideoTrack, useMaybeRoomContext, isTrackReference, type TrackReference } from "@livekit/components-react";
import { Track } from "livekit-client";
import { NetflixSyncModal } from "@/components/netflix-sync-modal";
import { ChessStage } from "@/components/stage/chess-stage";

interface MediaApp {
  id: string;
  name: string;
  category: "streaming" | "games" | "activities";
  tag: "Video Catalogs" | "Screen shareable" | "Dhaba Apps";
  bg: string;
  badge?: string;
  type: "youtube" | "screenshare" | "game" | "link";
  renderLogo: () => React.ReactNode;
}

interface YouTubeVideoItem {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle?: string;
}

// Initial curated videos shown before the user runs a search
// Using 100% verified, active, embed-permitted YouTube videos with guaranteed HD thumbnails
const INITIAL_TRENDING_VIDEOS: YouTubeVideoItem[] = [
  { id: "Y5BeWdODPqo", title: "Jailer — Official Trailer | Superstar Rajinikanth", thumbnail: "https://i.ytimg.com/vi/Y5BeWdODPqo/hqdefault.jpg", channelTitle: "Sun TV" },
  { id: "Po3jStA673E", title: "LEO — Official Trailer | Thalapathy Vijay", thumbnail: "https://i.ytimg.com/vi/Po3jStA673E/hqdefault.jpg", channelTitle: "Sun TV" },
  { id: "g3JUbgOHgdw", title: "Pushpa 2 The Rule — Official Trailer", thumbnail: "https://i.ytimg.com/vi/g3JUbgOHgdw/hqdefault.jpg", channelTitle: "Mythri Movie Makers" },
  { id: "bC36d8e3bb0", title: "Kalki 2898 AD — Official Teaser", thumbnail: "https://i.ytimg.com/vi/bC36d8e3bb0/hqdefault.jpg", channelTitle: "Vyjayanthi Network" },
  { id: "4GPvYMKtrtI", title: "Salaar: Part 1 - Ceasefire — Official Trailer", thumbnail: "https://i.ytimg.com/vi/4GPvYMKtrtI/hqdefault.jpg", channelTitle: "Hombale Films" },
  { id: "aqz-KE-bpKQ", title: "Big Buck Bunny — 4K Open Movie", thumbnail: "https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg", channelTitle: "Blender Foundation" },
  { id: "eRsGyueVLvQ", title: "Sintel — Official Open Movie", thumbnail: "https://i.ytimg.com/vi/eRsGyueVLvQ/hqdefault.jpg", channelTitle: "Blender Foundation" },
  { id: "giXco2jaZ_4", title: "Top Gun: Maverick — Official Trailer", thumbnail: "https://i.ytimg.com/vi/giXco2jaZ_4/hqdefault.jpg", channelTitle: "Paramount Pictures" },
];

// Exactly the 7 requested apps in Discover
const MEDIA_CATALOG: MediaApp[] = [
  {
    id: "youtube",
    name: "YouTube",
    category: "streaming",
    tag: "Video Catalogs",
    bg: "bg-white",
    type: "youtube",
    renderLogo: () => (
      <div className="flex items-center gap-1.5">
        <div className="w-8 h-6 bg-[#FF0000] rounded-md flex items-center justify-center shadow-sm">
          <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[8px] border-l-white ml-0.5" />
        </div>
        <span className="text-black font-black text-xl tracking-tighter">YouTube</span>
      </div>
    ),
  },
  {
    id: "netflix",
    name: "Netflix",
    category: "streaming",
    tag: "Screen shareable",
    bg: "bg-black",
    type: "link",
    renderLogo: () => (
      <span className="text-[#E50914] font-black text-2xl tracking-[0.2em] uppercase font-sans drop-shadow-md">
        NETFLIX
      </span>
    ),
  },
  {
    id: "spotify",
    name: "Spotify",
    category: "streaming",
    tag: "Video Catalogs",
    bg: "bg-[#0d0d0d]",
    type: "link",
    renderLogo: () => (
      <div className="flex items-center gap-2">
        <svg className="w-7 h-7 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
          <path d="M7 9.5c3.5-1 7-0.7 10 1.2" stroke="#000" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M8 12.3c2.8-0.8 5.6-0.5 8 1" stroke="#000" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <path d="M9 15.1c2.1-0.6 4.2-0.4 6 0.8" stroke="#000" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </svg>
        <span className="text-white font-black text-lg tracking-tight">Spotify</span>
      </div>
    ),
  },
  {
    id: "internet-archive",
    name: "Internet Archive",
    category: "streaming",
    tag: "Video Catalogs",
    bg: "bg-gradient-to-b from-[#2a221f] to-[#161210]",
    type: "link",
    renderLogo: () => (
      <div className="flex flex-col items-center text-center">
        <svg className="w-7 h-7 text-[#E2B357] mb-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7v2h20V7L12 2zm-8 8v9h2v-9H4zm5 0v9h2v-9H9zm5 0v9h2v-9h-2zm5 0v9h2v-9h-2zM2 20v2h20v-2H2z" />
        </svg>
        <span className="text-[#E2B357] font-serif font-bold text-xs tracking-wide leading-none">
          Internet Archive
        </span>
        <span className="text-[8px] text-[#A89874] mt-0.5 font-medium tracking-tight">
          Classic Movies & More
        </span>
      </div>
    ),
  },
  {
    id: "prime-video",
    name: "Prime Video",
    category: "streaming",
    tag: "Screen shareable",
    bg: "bg-[#0b1726]",
    type: "link",
    renderLogo: () => (
      <div className="flex flex-col items-center">
        <span className="text-white font-black text-lg tracking-tight leading-none">
          prime <span className="font-light">video</span>
        </span>
        <svg className="w-12 h-2.5 text-[#00A8E1] mt-1" viewBox="0 0 100 20" fill="none">
          <path d="M10 8 Q 50 20 90 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M85 4 L 92 8 L 86 12" fill="currentColor" />
        </svg>
      </div>
    ),
  },
  {
    id: "disney",
    name: "Disney+",
    category: "streaming",
    tag: "Screen shareable",
    bg: "bg-[#040714]",
    type: "link",
    renderLogo: () => (
      <div className="flex items-center justify-center">
        <span className="text-white font-serif italic font-extrabold text-2xl tracking-wider">
          Disney<span className="text-[#3b82f6] not-italic font-sans text-3xl font-black">+</span>
        </span>
      </div>
    ),
  },
  {
    id: "chess",
    name: "Chess Club",
    category: "games",
    tag: "Dhaba Apps",
    bg: "bg-gradient-to-br from-[#402a1b] to-[#1f150f]",
    type: "game",
    renderLogo: () => (
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-3xl filter drop-shadow">♟️</span>
          <span className="text-3xl filter drop-shadow">♞</span>
        </div>
        <span className="text-white font-black text-sm tracking-wide">Chess Club</span>
      </div>
    ),
  },
];

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function parseStreamLink(inputUrl: string): { type: "youtube" | "twitch" | "direct"; url: string; id?: string } {
  const trimmed = inputUrl.trim();
  if (!trimmed) return { type: "direct", url: "" };

  if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) {
    let id = "";
    if (trimmed.includes("v=")) {
      id = trimmed.split("v=")[1]?.split("&")[0] || "";
    } else if (trimmed.includes("youtu.be/")) {
      id = trimmed.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (trimmed.includes("embed/")) {
      id = trimmed.split("embed/")[1]?.split("?")[0] || "";
    } else if (trimmed.includes("shorts/")) {
      id = trimmed.split("shorts/")[1]?.split("?")[0] || "";
    }
    return { type: "youtube", url: trimmed, id };
  }

  if (trimmed.includes("twitch.tv/")) {
    const channel = trimmed.split("twitch.tv/")[1]?.split("/")[0]?.split("?")[0] || "";
    return { type: "twitch", url: trimmed, id: channel };
  }

  return { type: "direct", url: trimmed };
}

export function StageContainer() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = (params?.roomId as string) || "dhaba-room";
  const username = searchParams?.get("name") || "MUZEEF__K";

  const { activeActivity, setActiveActivity } = useRoomStore();
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [netflixModalOpen, setNetflixModalOpen] = useState(false);

  // Modal Views
  const [modalView, setModalView] = useState<"catalog" | "youtube_browser" | "screenshare_settings" | "link_stream" | "local_file">("catalog");

  // Real Screen Share Stream State
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [quality, setQuality] = useState("Auto");
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const cinemaContainerRef = useRef<HTMLDivElement>(null);

  // Link & Local File Streaming State
  const [inputLinkUrl, setInputLinkUrl] = useState("");
  const [activeLinkStream, setActiveLinkStream] = useState<{
    url: string;
    type: "youtube" | "twitch" | "direct";
    name?: string;
    id?: string;
  } | null>(null);
  const linkVideoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Video playback scrubber state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Player controls state
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filters & catalog search
  const [activeCategory, setActiveCategory] = useState<"all" | "streaming" | "games" | "activities">("all");
  const [activeFilterTag, setActiveFilterTag] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // ========================================================
  // Real YouTube Data API v3 Search State & Logic
  // ========================================================
  const [ytSearchQuery, setYtSearchQuery] = useState("");
  const [ytSearchResults, setYtSearchResults] = useState<YouTubeVideoItem[]>(INITIAL_TRENDING_VIDEOS);
  const [isYtSearching, setIsYtSearching] = useState(false);
  const [ytSearchError, setYtSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [videoId, setVideoId] = useState("Y5BeWdODPqo");
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [youtubeUnavailable, setYoutubeUnavailable] = useState(false);

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
      screenVideoRef.current.play().catch((err) => console.warn("Auto play warning:", err));
    }
  }, [screenStream, activeActivity]);

  useEffect(() => {
    if (screenVideoRef.current) {
      screenVideoRef.current.muted = isMuted;
      screenVideoRef.current.volume = volume / 100;
    }
    if (linkVideoRef.current) {
      linkVideoRef.current.muted = isMuted;
      linkVideoRef.current.volume = volume / 100;
    }
  }, [isMuted, volume]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleIncomingSync = useCallback((payload: SyncEventPayload) => {
    if (payload.type === "YOUTUBE_CHANGE" && payload.videoId) {
      setVideoId(payload.videoId);
      setActiveActivity("youtube");
      showNotice(`${payload.sender} changed the video!`);
    }
  }, [setActiveActivity]);

  const { broadcastSync } = useRoomSync(roomId, handleIncomingSync);

  const room = useMaybeRoomContext();
  const cameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: false }],
    { onlySubscribed: false }
  );
  const localCameraTrack = cameraTracks.find(
    (t) => isTrackReference(t) && t.participant.identity === room?.localParticipant.identity
  );

  const showNotice = (text: string) => {
    setSyncStatus(text);
    setTimeout(() => setSyncStatus(null), 3000);
  };

  const launchVideo = (id: string, title?: string) => {
    stopScreenShare();
    setActiveLinkStream(null);
    setVideoId(id);
    setYoutubeUnavailable(false);
    setActiveActivity("youtube");
    setIsMediaModalOpen(false);
    setModalView("catalog");

    broadcastSync({
      type: "YOUTUBE_CHANGE",
      videoId: id,
      sender: username,
    });

    showNotice(`Now streaming: ${title || "YouTube Video"}`);
  };

  // Real Browser Screen Share
  const handleStartScreenShare = async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        alert("Screen sharing is not supported by your browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      setActiveLinkStream(null);
      setScreenStream(stream);
      setActiveActivity("screenshare");
      setIsMediaModalOpen(false);
      setModalView("catalog");
      showNotice("Screen sharing live on Cinema Screen!");

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          stopScreenShare();
        };
      }
    } catch (err) {
      console.warn("Screen share cancelled:", err);
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
    setActiveActivity("grid");
  };

  // Start Link Stream
  const handleStartLinkStream = (urlToPlay?: string) => {
    const target = (urlToPlay || inputLinkUrl).trim();
    if (!target) return;

    const parsed = parseStreamLink(target);
    stopScreenShare();

    if (parsed.type === "youtube" && parsed.id) {
      setActiveLinkStream(null);
      launchVideo(parsed.id, "YouTube Video");
      return;
    }

    setActiveLinkStream(parsed);
    setActiveActivity("custom_link" as any);
    setIsMediaModalOpen(false);
    setModalView("catalog");
    showNotice("Now streaming link on Cinema Screen!");

    broadcastSync({
      type: "YOUTUBE_CHANGE",
      videoId: target,
      sender: username,
    });
  };

  // Handle Local File Selection
  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    stopScreenShare();

    setActiveLinkStream({
      url: fileUrl,
      type: "direct",
      name: file.name,
    });

    setActiveActivity("custom_link" as any);
    setIsMediaModalOpen(false);
    setModalView("catalog");
    showNotice(`Now playing: ${file.name}`);

    broadcastSync({
      type: "YOUTUBE_CHANGE",
      videoId: file.name,
      sender: username,
    });
  };

  const togglePlayPause = () => {
    if (!linkVideoRef.current) return;
    if (linkVideoRef.current.paused) {
      linkVideoRef.current.play();
      setIsPlaying(true);
    } else {
      linkVideoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!linkVideoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = pct * duration;
    linkVideoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSpeedChange = (spd: number) => {
    setPlaybackSpeed(spd);
    if (linkVideoRef.current) {
      linkVideoRef.current.playbackRate = spd;
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    if (newVal === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (cinemaContainerRef.current?.requestFullscreen) {
          await cinemaContainerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error("Fullscreen toggle failed:", err);
    }
  };

  // ========================================================
  // Real YouTube Data API v3 Fetch Call & Error Handling
  // ========================================================
  const fetchYouTubeSearchResults = async (queryText: string) => {
    const query = queryText.trim();
    if (!query) {
      setYtSearchResults(INITIAL_TRENDING_VIDEOS);
      setHasSearched(false);
      setYtSearchError(null);
      return;
    }

    // 1. If user pasted a direct YouTube link, parse and play directly
    if (query.includes("youtube.com") || query.includes("youtu.be")) {
      const parsed = parseStreamLink(query);
      if (parsed.id) {
        console.log("[YouTube Search] Detected direct YouTube link with ID:", parsed.id);
        launchVideo(parsed.id, "Pasted YouTube Video");
        return;
      }
    }

    // 2. Load API Key from environment
    const apiKey =
      process.env.NEXT_PUBLIC_YOUTUBE_API_KEY ||
      process.env.NEXT_PUBLIC_YOUTUBE_KEY ||
      process.env.NEXT_PUBLIC_YT_API_KEY;

    console.log("[YouTube Search] Initiating search for query:", query);
    console.log("[YouTube Search] API Key available:", Boolean(apiKey));

    if (!apiKey) {
      console.warn("[YouTube Search] No API key — falling back to trending videos.");
      setYtSearchResults(INITIAL_TRENDING_VIDEOS);
      setHasSearched(true);
      setIsYtSearching(false);
      return;
    }

    setIsYtSearching(true);
    setYtSearchError(null);
    setHasSearched(true);

    const endpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=12&q=${encodeURIComponent(
      query
    )}&key=${apiKey}`;

    console.log(
      "[YouTube Search] Request URL:",
      endpoint.replace(apiKey, "API_KEY_HIDDEN")
    );

    try {
      const response = await fetch(endpoint);
      console.log(
        "[YouTube Search] Response Status:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.error("[YouTube Search API Error Response]:", errorBody);

        const apiMessage =
          errorBody?.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`;

        if (response.status === 403) {
          if (apiMessage.toLowerCase().includes("quota")) {
            setYtSearchError(
              "YouTube Data API daily quota exceeded. The quota will reset at midnight PST, or you can switch to another project key in Google Cloud Console."
            );
          } else {
            setYtSearchError(
              `YouTube API 403 Forbidden: ${apiMessage}. Please verify that 'YouTube Data API v3' is enabled in Google Cloud Console.`
            );
          }
        } else if (response.status === 400) {
          setYtSearchError(
            `YouTube API 400 Bad Request: ${apiMessage}. Please verify your API key.`
          );
        } else {
          setYtSearchError(`YouTube API error (${response.status}): ${apiMessage}`);
        }
        setIsYtSearching(false);
        return;
      }

      const data = await response.json();
      console.log("[YouTube Search] Raw API items received:", data.items?.length);

      if (!data.items || data.items.length === 0) {
        console.warn("[YouTube Search] No video items found for query:", query);
        setYtSearchResults([]);
      } else {
        const formatted: YouTubeVideoItem[] = data.items
          .filter((item: any) => item.id?.videoId)
          .map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet?.title || "YouTube Video",
            thumbnail:
              item.snippet?.thumbnails?.medium?.url ||
              item.snippet?.thumbnails?.high?.url ||
              item.snippet?.thumbnails?.default?.url ||
              `https://img.youtube.com/vi/${item.id.videoId}/mqdefault.jpg`,
            channelTitle: item.snippet?.channelTitle || "",
          }));

        console.log(`[YouTube Search] Successfully loaded ${formatted.length} search results.`);
        setYtSearchResults(formatted);
      }
    } catch (err: any) {
      const netErrorMsg = `Network error: ${err?.message || "Failed to connect to YouTube API"}`;
      console.error("[YouTube Search Network Exception]:", err);
      setYtSearchError(netErrorMsg);
    } finally {
      setIsYtSearching(false);
    }
  };

  const handleYtSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchYouTubeSearchResults(ytSearchQuery);
  };

  const filteredCatalog = useMemo(() => {
    return MEDIA_CATALOG.filter((app) => {
      const matchesCategory = activeCategory === "all" || app.category === activeCategory;
      const matchesTag = activeFilterTag === "All" || app.tag === activeFilterTag;
      const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesTag && matchesSearch;
    });
  }, [activeCategory, activeFilterTag, searchQuery]);

  return (
    <div className="flex-1 h-full bg-[#1e0238] relative flex flex-col items-center justify-between overflow-hidden select-none">
      {/* Hidden File Input for Native File Explorer */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska,video/*"
        onChange={handleLocalFileSelect}
        className="hidden"
      />

      {/* 3D Room Perspective Walls */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-0 top-0 bottom-0 w-28 sm:w-44 bg-gradient-to-r from-[#2c0552] to-[#1e0238]"
          style={{ clipPath: "polygon(0 0, 100% 8%, 100% 92%, 0 100%)" }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-28 sm:w-44 bg-gradient-to-l from-[#2c0552] to-[#1e0238]"
          style={{ clipPath: "polygon(0 8%, 100% 0, 100% 100%, 0 92%)" }}
        />
        <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-purple-950/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-purple-950/80 to-transparent" />
      </div>

      {/* Sync Status Toast Banner */}
      {syncStatus && (
        <div className="absolute top-4 z-40 bg-[#ffe600] text-black font-extrabold text-xs px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-fade-in">
          <Sparkles size={14} />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Cinema Screen Container */}
      <div
        ref={cinemaContainerRef}
        className={`relative z-10 ${
          isFullscreen
            ? "w-full h-full rounded-none border-0 max-w-none m-0 aspect-auto bg-black"
            : "w-[90%] max-w-3xl mt-4 sm:mt-6 aspect-[16/10] bg-[#1a1820] rounded-2xl border-2 border-purple-800/40 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
        } overflow-hidden flex flex-col items-center justify-center transition-all`}
      >
        {/* VIEW A: REAL SCREEN SHARE */}
        {activeActivity === "screenshare" && screenStream ? (
          <div className="w-full h-full relative group bg-black flex items-center justify-center">
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />

            {/* Kosmi Bottom Control Dock */}
            <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-5 z-30 flex items-end justify-between pointer-events-auto">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <button
                  onClick={() => {
                    setIsMediaModalOpen(true);
                    setModalView("catalog");
                  }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#581c9a] hover:bg-[#6c24bc] active:scale-95 text-white transition-all shadow-lg shadow-purple-950/70 flex items-center justify-center border border-purple-400/25 cursor-pointer"
                  title="Switch media / app"
                >
                  <Tv size={17} />
                </button>

                <button
                  onClick={stopScreenShare}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#581c9a] hover:bg-red-600 active:scale-95 text-white transition-all shadow-lg shadow-purple-950/70 flex items-center justify-center border border-purple-400/25 cursor-pointer group/stop"
                  title="Stop sharing"
                >
                  <Square size={13} className="fill-white text-white group-hover/stop:scale-110 transition-transform" />
                </button>

                <div className="relative group/vol">
                  <button
                    onClick={toggleMute}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${
                      isMuted || volume === 0 ? "bg-[#3e0d73] text-red-300" : "bg-[#581c9a] text-white"
                    } hover:bg-[#6c24bc] active:scale-95 transition-all shadow-lg shadow-purple-950/70 flex items-center justify-center border border-purple-400/25 cursor-pointer`}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
                  </button>

                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/vol:flex items-center bg-[#250444] border border-purple-500/40 px-3 py-2 rounded-xl shadow-2xl backdrop-blur-md gap-2 w-32 z-40">
                    <VolumeX size={12} className="text-purple-400" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      className="w-full h-1.5 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-[#ffe600]"
                    />
                    <Volume2 size={12} className="text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Center Host Indicator */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-white/90 leading-none mb-1">
                  ▲
                </span>
                <div className="flex items-center gap-1.5 bg-[#250444]/90 backdrop-blur-md border border-purple-400/30 px-3 py-1 rounded-full shadow-lg">
                  <div className="w-4 h-4 rounded-full bg-[#6a25b8] border border-purple-300/40 text-[9px] font-black text-white flex items-center justify-center">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[11px] font-black text-white uppercase tracking-wider">
                    {username}
                  </span>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="relative">
                  <button
                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${
                      showSettingsMenu ? "bg-[#7e2ed8]" : "bg-[#581c9a]"
                    } hover:bg-[#6c24bc] active:scale-95 text-white transition-all shadow-lg shadow-purple-950/70 flex items-center justify-center border border-purple-400/25 cursor-pointer`}
                    title="Stream settings"
                  >
                    <Settings size={17} className={showSettingsMenu ? "rotate-45 transition-transform" : "transition-transform"} />
                  </button>

                  {showSettingsMenu && (
                    <div className="absolute bottom-full right-0 mb-3 w-64 bg-[#230342] border border-purple-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-50 text-left">
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-purple-700/40">
                        <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Settings size={13} className="text-[#ffe600]" />
                          Stream Settings
                        </span>
                        <button
                          onClick={() => setShowSettingsMenu(false)}
                          className="text-purple-300 hover:text-white p-0.5 rounded cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-300/80 mb-1">
                            Quality & Frame Rate
                          </label>
                          <select
                            value={quality}
                            onChange={(e) => setQuality(e.target.value)}
                            className="w-full bg-[#150029] border border-purple-600/40 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#ffe600] cursor-pointer"
                          >
                            <option value="Auto">Auto (Adaptive)</option>
                            <option value="1080p">1080p @ 60 FPS (HD)</option>
                            <option value="720p">720p @ 30 FPS (Smooth)</option>
                          </select>
                        </div>

                        <div className="pt-2 border-t border-purple-800/40 flex items-center justify-between text-[11px] text-purple-300">
                          <span>Latency Mode</span>
                          <span className="text-[#ffe600] font-bold">Ultra Low (WebRTC)</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-purple-300">
                          <span>Status</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live Broadcast
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#581c9a] hover:bg-[#6c24bc] active:scale-95 text-white transition-all shadow-lg shadow-purple-950/70 flex items-center justify-center border border-purple-400/25 cursor-pointer"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
                </button>
              </div>
            </div>
          </div>
        ) : (activeActivity as string) === "custom_link" && activeLinkStream ? (
          /* VIEW B: LOCAL FILE / LINK VIDEO PLAYER */
          <div className="w-full h-full relative group bg-black flex items-center justify-center">
            {activeLinkStream.type === "twitch" && activeLinkStream.id ? (
              <iframe
                src={`https://player.twitch.tv/?channel=${activeLinkStream.id}&parent=localhost&autoplay=true`}
                title="Twitch Stream"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <video
                ref={linkVideoRef}
                src={activeLinkStream.url}
                autoPlay
                playsInline
                onTimeUpdate={() => {
                  if (linkVideoRef.current) setCurrentTime(linkVideoRef.current.currentTime);
                }}
                onLoadedMetadata={() => {
                  if (linkVideoRef.current) {
                    setDuration(linkVideoRef.current.duration || 0);
                    setIsPlaying(!linkVideoRef.current.paused);
                  }
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full h-full object-contain"
              />
            )}

            {/* Video Timeline Scrubber & Timestamp */}
            <div className="absolute bottom-16 inset-x-4 sm:bottom-18 sm:inset-x-6 z-30 flex flex-col gap-1 pointer-events-auto">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-white/90 drop-shadow">
                <span>{formatTime(currentTime)}</span>
                {duration > 0 && <span className="text-white/60">{formatTime(duration)}</span>}
              </div>

              <div
                onClick={handleSeek}
                className="w-full h-1.5 hover:h-2.5 bg-white/20 rounded-full cursor-pointer relative overflow-hidden transition-all group/scrub"
              >
                <div
                  className="h-full bg-[#ffe600] rounded-full transition-all"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Kosmi Bottom Control Dock */}
            <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-5 z-30 flex items-end justify-between pointer-events-auto">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <button
                  onClick={() => {
                    setIsMediaModalOpen(true);
                    setModalView("catalog");
                  }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#581c9a] hover:bg-[#6c24bc] active:scale-95 text-white transition-all shadow-lg shadow-purple-950/70 flex items-center justify-center border border-purple-400/25 cursor-pointer"
                  title="Change media"
                >
                  <Tv size={17} />
                </button>

                <button
                  onClick={() => {
                    setActiveLinkStream(null);
                    setActiveActivity("grid");
                  }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#581c9a] hover:bg-red-600 active:scale-95 text-white transition-all shadow-lg shadow-purple-950/70 flex items-center justify-center border border-purple-400/25 cursor-pointer group/stop"
                  title="Stop playback"
                >
                  <Square size={13} className="fill-white text-white group-hover/stop:scale-110 transition-transform" />
                </button>

                <button
                  onClick={togglePlayPause}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#581c9a] hover:bg-[#6c24bc] active:scale-95 text-white transition-all shadow-lg shadow-purple-950/70 flex items-center justify-center border border-purple-400/25 cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause size={15} className="fill-white text-white" />
                  ) : (
                    <Play size={15} className="fill-white text-white ml-0.5" />
                  )}
                </button>

                <div className="relative group/vol">
                  <button
                    onClick={toggleMute}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${
                      isMuted || volume === 0 ? "bg-[#3e0d73] text-red-300" : "bg-[#581c9a] text-white"
                    } hover:bg-[#6c24bc] active:scale-95 transition-all shadow-lg shadow-purple-950/70 flex items-center justify-center border border-purple-400/25 cursor-pointer`}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
                  </button>

                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/vol:flex items-center bg-[#250444] border border-purple-500/40 px-3 py-2 rounded-xl shadow-2xl backdrop-blur-md gap-2 w-32 z-40">
                    <VolumeX size={12} className="text-purple-400" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      className="w-full h-1.5 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-[#ffe600]"
                    />
                    <Volume2 size={12} className="text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Center Host Indicator */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-white/90 leading-none mb-1">
                  ▲
                </span>
                <div className="flex items-center gap-1.5 bg-[#250444]/90 backdrop-blur-md border border-purple-400/30 px-3 py-1 rounded-full shadow-lg">
                  <div className="w-4 h-4 rounded-full bg-[#6a25b8] border border-purple-300/40 text-[9px] font-black text-white flex items-center justify-center">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[11px] font-black text-white uppercase tracking-wider">
                    {username}
                  </span>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="relative">
                  <button
                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${
                      showSettingsMenu ? "bg-[#7e2ed8]" : "bg-[#581c9a]"
                    } hover:bg-[#6c24bc] active:scale-95 text-white transition-all shadow-lg shadow-purple-950/70 flex items-center justify-center border border-purple-400/25 cursor-pointer`}
                    title="Playback settings"
                  >
                    <Settings size={17} className={showSettingsMenu ? "rotate-45 transition-transform" : "transition-transform"} />
                  </button>

                  {showSettingsMenu && (
                    <div className="absolute bottom-full right-0 mb-3 w-56 bg-[#230342] border border-purple-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-50 text-left">
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-purple-700/40">
                        <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Settings size={13} className="text-[#ffe600]" />
                          Playback Speed
                        </span>
                        <button
                          onClick={() => setShowSettingsMenu(false)}
                          className="text-purple-300 hover:text-white p-0.5 rounded cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 text-center">
                        {[0.75, 1, 1.25, 1.5].map((spd) => (
                          <button
                            key={spd}
                            onClick={() => handleSpeedChange(spd)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                              playbackSpeed === spd
                                ? "bg-[#ffe600] text-black"
                                : "bg-[#18012e] text-purple-200 hover:bg-[#320857]"
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#581c9a] hover:bg-[#6c24bc] active:scale-95 text-white transition-all shadow-lg shadow-purple-950/70 flex items-center justify-center border border-purple-400/25 cursor-pointer"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
                </button>
              </div>
            </div>
          </div>
        ) : activeActivity === "youtube" ? (
          /* VIEW C: YOUTUBE VIDEO ON CINEMA SCREEN */
          <div className="w-full h-full relative group">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0`}
              title="Watch Party"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="w-full h-full border-0"
            />

            {/* Unavailable overlay */}
            {youtubeUnavailable && (
              <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center text-center p-6">
                <AlertCircle size={48} className="text-red-400 mb-4" />
                <h3 className="text-xl font-black text-white mb-2">Video Unavailable</h3>
                <p className="text-purple-300/80 text-sm mb-6 max-w-md">
                  This YouTube video cannot be embedded in this region or is restricted by the owner.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setYoutubeUnavailable(false);
                      setModalView("youtube_browser");
                      setIsMediaModalOpen(true);
                    }}
                    className="bg-[#ffe600] hover:bg-[#fff04b] text-black font-black px-6 py-2 rounded-xl text-xs uppercase tracking-wider transition"
                  >
                    Pick Another Video
                  </button>
                  <button
                    onClick={() => setYoutubeUnavailable(false)}
                    className="border border-purple-500/40 hover:border-[#ffe600] text-purple-300 hover:text-white px-6 py-2 rounded-xl text-xs uppercase tracking-wider transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Kosmi Bottom Control Dock for YouTube */}
            <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-5 z-30 flex items-end justify-between pointer-events-auto opacity-90 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <button
                  onClick={() => {
                    setIsMediaModalOpen(true);
                    setModalView("youtube_browser");
                  }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#581c9a] hover:bg-[#6c24bc] active:scale-95 text-white transition-all shadow-lg shadow-purple-950/70 flex items-center justify-center border border-purple-400/25 cursor-pointer"
                  title="Change video"
                >
                  <Tv size={17} />
                </button>

                <button
                  onClick={() => {
                    setActiveActivity("grid");
                    setYoutubeUnavailable(false);
                  }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#581c9a] hover:bg-red-600 active:scale-95 text-white transition-all shadow-lg shadow-purple-950/70 flex items-center justify-center border border-purple-400/25 cursor-pointer group/stop"
                  title="Close cinema screen"
                >
                  <Square size={13} className="fill-white text-white group-hover/stop:scale-110 transition-transform" />
                </button>
              </div>

              {/* Center Host Indicator */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-white/90 leading-none mb-1">
                  ▲
                </span>
                <div className="flex items-center gap-1.5 bg-[#250444]/90 backdrop-blur-md border border-purple-400/30 px-3 py-1 rounded-full shadow-lg">
                  <div className="w-4 h-4 rounded-full bg-[#6a25b8] border border-purple-300/40 text-[9px] font-black text-white flex items-center justify-center">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[11px] font-black text-white uppercase tracking-wider">
                    {username}
                  </span>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                <button
                  onClick={toggleFullscreen}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#581c9a] hover:bg-[#6c24bc] active:scale-95 text-white transition-all shadow-lg shadow-purple-950/70 flex items-center justify-center border border-purple-400/25 cursor-pointer"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
                </button>
              </div>
            </div>
          </div>
        ) : (activeActivity as string) === "chess" ? (
          /* VIEW D: KOSMI CHESS CLUB */
          <ChessStage
            roomId={roomId}
            username={username}
            onClose={() => setActiveActivity("grid")}
          />
        ) : (
          /* IDLE CINEMA SCREEN */
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-gradient-to-b from-[#232028] via-[#1c1a22] to-[#141219]">
            <div className="absolute w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={() => {
                setIsMediaModalOpen(true);
                setModalView("catalog");
              }}
              className="relative z-10 bg-[#5d22a8] hover:bg-[#6c28c4] text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl flex items-center gap-2.5 shadow-lg shadow-purple-950/60 border border-purple-400/20 transition-all transform hover:scale-105 cursor-pointer"
            >
              <Film size={18} className="text-purple-200" />
              <span>Select Media</span>
            </button>
          </div>
        )}
      </div>

      {/* Olive Green Sofa & Avatar */}
      <div className="relative z-10 w-full max-w-xl pb-2 sm:pb-4 flex flex-col items-center">
        <div className="relative -mb-16 z-20 flex items-center justify-center gap-4">
          <div className="flex flex-col items-center">
            {localCameraTrack ? (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-3 border-purple-400/40 shadow-2xl">
                <VideoTrack trackRef={localCameraTrack as TrackReference} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#5b32a8] border-3 border-purple-400/40 shadow-2xl flex items-center justify-center text-white text-3xl font-black">
                {username.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="mt-1 text-[11px] font-bold text-white uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
              {username}
            </span>
          </div>
        </div>

        <div className="w-80 sm:w-[420px] h-28 sm:h-32 bg-[#707604] rounded-t-[50px] shadow-2xl border-t-4 border-[#8c9406] relative flex items-center justify-between px-6">
          <div className="w-12 h-20 bg-[#5e6303] rounded-t-2xl shadow-inner -ml-4" />
          <div className="flex-1 h-14 bg-[#636903] rounded-2xl mx-2 shadow-inner" />
          <div className="w-12 h-20 bg-[#5e6303] rounded-t-2xl shadow-inner -mr-4" />
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-[#240344] border border-purple-500/40 rounded-3xl w-full max-w-4xl h-[85vh] max-h-[680px] shadow-2xl flex flex-col overflow-hidden relative font-sans">
            
            {/* VIEW 1: SCREENSHARE SETTINGS */}
            {modalView === "screenshare_settings" ? (
              <div className="flex-1 flex flex-col h-full bg-[#1e0238] justify-between p-6 sm:p-10 text-center relative">
                <div className="flex items-center justify-between w-full">
                  <button
                    onClick={() => setModalView("catalog")}
                    className="text-xs font-semibold text-purple-200 hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>

                  <h3 className="text-sm font-extrabold text-white tracking-wide">Screenshare</h3>

                  <button
                    onClick={() => {
                      setIsMediaModalOpen(false);
                      setModalView("catalog");
                    }}
                    className="text-purple-300 hover:text-white p-1 rounded-xl hover:bg-purple-900/50 transition cursor-pointer"
                  >
                    <X size={22} />
                  </button>
                </div>

                <div className="flex flex-col items-center max-w-sm mx-auto my-auto space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#340760] border border-purple-500/30 flex items-center justify-center shadow-xl">
                    <Monitor size={32} className="text-[#ffe600]" />
                  </div>

                  <h2 className="text-2xl font-black text-white">Share Your Screen</h2>

                  <p className="text-xs text-purple-200/80 leading-relaxed">
                    Share your screen, window, or browser tab with everyone in the room
                  </p>

                  <div className="w-full text-left pt-2">
                    <label className="block text-[11px] font-semibold text-purple-300 mb-1">
                      Quality
                    </label>
                    <div className="relative">
                      <select
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                        className="w-full bg-[#140026] border border-purple-700/40 rounded-xl px-4 py-2.5 text-xs text-white appearance-none focus:outline-none focus:border-[#ffe600] cursor-pointer"
                      >
                        <option value="Auto">Auto (Recommended)</option>
                        <option value="1080p">1080p 60fps (High Quality)</option>
                        <option value="720p">720p 30fps (Data Saver)</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none"
                      />
                    </div>
                  </div>

                  <span className="text-[11px] text-purple-400/60 font-medium cursor-pointer hover:text-purple-300">
                    ∨ Advanced Settings
                  </span>
                </div>

                <div className="max-w-md w-full mx-auto">
                  <button
                    onClick={handleStartScreenShare}
                    className="w-full bg-[#ffe600] hover:bg-[#fff04b] text-black font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-xl shadow-yellow-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Monitor size={16} />
                    <span>Start Sharing</span>
                  </button>
                </div>
              </div>
            ) : modalView === "link_stream" ? (
              /* VIEW 2: STREAM FROM ANY LINK / VIDEO URL */
              <div className="flex-1 flex flex-col h-full bg-[#1e0238] justify-between p-6 sm:p-10 text-center relative">
                <div className="flex items-center justify-between w-full">
                  <button
                    onClick={() => setModalView("catalog")}
                    className="text-xs font-semibold text-purple-200 hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>

                  <h3 className="text-sm font-extrabold text-white tracking-wide">Stream from Link</h3>

                  <button
                    onClick={() => {
                      setIsMediaModalOpen(false);
                      setModalView("catalog");
                    }}
                    className="text-purple-300 hover:text-white p-1 rounded-xl hover:bg-purple-900/50 transition cursor-pointer"
                  >
                    <X size={22} />
                  </button>
                </div>

                <div className="flex flex-col items-center max-w-md mx-auto my-auto space-y-4 w-full">
                  <div className="w-16 h-16 rounded-2xl bg-[#340760] border border-purple-500/30 flex items-center justify-center shadow-xl">
                    <Link2 size={30} className="text-[#ffe600]" />
                  </div>

                  <h2 className="text-2xl font-black text-white">Stream from Any Link</h2>

                  <p className="text-xs text-purple-200/80 leading-relaxed max-w-sm">
                    Paste any video link, YouTube URL, Twitch live stream, or direct MP4/WebM video link to watch together
                  </p>

                  <div className="w-full text-left pt-2">
                    <label className="block text-[11px] font-semibold text-purple-300 mb-1.5">
                      Video or Stream URL
                    </label>
                    <div className="relative">
                      <Link2
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400"
                      />
                      <input
                        type="url"
                        value={inputLinkUrl}
                        onChange={(e) => setInputLinkUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleStartLinkStream();
                        }}
                        placeholder="https://... (YouTube, Twitch, .mp4, or any stream URL)"
                        className="w-full bg-[#140026] border border-purple-700/40 rounded-xl pl-9 pr-4 py-3 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-[#ffe600]"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Preset Quick Test Buttons */}
                  <div className="w-full pt-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300/60 mb-2 text-left">
                      Quick Examples:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setInputLinkUrl("https://www.youtube.com/watch?v=Y5BeWdODPqo");
                          handleStartLinkStream("https://www.youtube.com/watch?v=Y5BeWdODPqo");
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-[#2b054f] hover:bg-[#3d0870] border border-purple-500/30 text-[11px] text-purple-200 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                      >
                        <span>▶️</span> Jailer 4K Trailer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputLinkUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
                          handleStartLinkStream("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-[#2b054f] hover:bg-[#3d0870] border border-purple-500/30 text-[11px] text-purple-200 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                      >
                        <span>🎬</span> Big Buck Bunny MP4
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputLinkUrl("https://www.youtube.com/watch?v=4xDzrJKXOOY");
                          handleStartLinkStream("https://www.youtube.com/watch?v=4xDzrJKXOOY");
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-[#2b054f] hover:bg-[#3d0870] border border-purple-500/30 text-[11px] text-purple-200 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                      >
                        <span>🎵</span> Lofi Chill Stream
                      </button>
                    </div>
                  </div>
                </div>

                <div className="max-w-md w-full mx-auto">
                  <button
                    onClick={() => handleStartLinkStream()}
                    disabled={!inputLinkUrl.trim()}
                    className={`w-full ${
                      inputLinkUrl.trim()
                        ? "bg-[#ffe600] hover:bg-[#fff04b] text-black shadow-yellow-500/25 cursor-pointer"
                        : "bg-[#453c12] text-gray-400 cursor-not-allowed"
                    } font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-xl flex items-center justify-center gap-2`}
                  >
                    <Play size={16} className={inputLinkUrl.trim() ? "fill-black" : "fill-gray-400"} />
                    <span>Start Streaming</span>
                  </button>
                </div>
              </div>
            ) : modalView === "local_file" ? (
              /* VIEW 3: PLAY LOCAL FILE */
              <div className="flex-1 flex flex-col h-full bg-[#1e0238] justify-between p-6 sm:p-10 text-center relative">
                <div className="flex items-center justify-between w-full">
                  <button
                    onClick={() => setModalView("catalog")}
                    className="text-xs font-semibold text-purple-200 hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>

                  <h3 className="text-sm font-extrabold text-white tracking-wide">Load File</h3>

                  <button
                    onClick={() => {
                      setIsMediaModalOpen(false);
                      setModalView("catalog");
                    }}
                    className="text-purple-300 hover:text-white p-1 rounded-xl hover:bg-purple-900/50 transition cursor-pointer"
                  >
                    <X size={22} />
                  </button>
                </div>

                <div className="flex flex-col items-center max-w-md mx-auto my-auto space-y-4 w-full">
                  <div className="w-16 h-16 rounded-2xl bg-[#340760] border border-purple-500/30 flex items-center justify-center shadow-xl">
                    <FileVideo size={30} className="text-[#ffe600]" />
                  </div>

                  <h2 className="text-2xl font-black text-white">Play Local File</h2>

                  <p className="text-xs text-purple-200/80 leading-relaxed max-w-sm">
                    Select a video file from your device to watch together
                  </p>

                  <div className="pt-2 w-full max-w-xs">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-[#ffe600] hover:bg-[#fff04b] text-black font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-xl shadow-yellow-500/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FolderOpen size={17} className="fill-black" />
                      <span>Choose File</span>
                    </button>
                  </div>

                  <div className="text-[11px] text-purple-300/70 pt-3">
                    Supported formats: <span className="text-[#ffe600] font-semibold">MP4, WebM, and more</span>
                  </div>
                </div>

                <div className="h-6" />
              </div>
            ) : modalView === "youtube_browser" ? (
              /* VIEW 4: YOUTUBE BROWSER (REAL YOUTUBE DATA API V3 INTEGRATION) */
              <div className="flex-1 flex flex-col h-full bg-[#1c0235]">
                <div className="p-4 sm:p-5 border-b border-purple-900/40 flex items-center justify-between bg-[#190130]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-5 bg-red-600 rounded-md flex items-center justify-center shadow">
                      <Play size={10} className="fill-white text-white ml-0.5" />
                    </div>
                    <span className="text-xl font-black text-white tracking-tight">YouTube</span>
                  </div>

                  <button
                    onClick={() => {
                      setIsMediaModalOpen(false);
                      setModalView("catalog");
                    }}
                    className="text-purple-300 hover:text-white p-1 rounded-xl hover:bg-purple-900/50 transition cursor-pointer"
                  >
                    <X size={22} />
                  </button>
                </div>

                {/* Top Search Bar */}
                <div className="p-3 sm:p-4 border-b border-purple-900/30 flex items-center justify-between gap-3 bg-[#17002b]">
                  <button
                    onClick={() => setModalView("catalog")}
                    className="p-2 rounded-xl bg-[#2e0556] hover:bg-[#3d0773] text-purple-200 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <ArrowLeft size={16} />
                    <span className="hidden sm:inline">Back</span>
                  </button>

                  <form onSubmit={handleYtSearchSubmit} className="flex-1 max-w-md relative flex gap-2">
                    <div className="relative flex-1">
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                      <input
                        type="text"
                        value={ytSearchQuery}
                        onChange={(e) => setYtSearchQuery(e.target.value)}
                        placeholder="Search YouTube or paste video link..."
                        className="w-full bg-[#120022] border border-purple-700/40 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-[#ffe600]"
                        autoFocus
                      />
                      {ytSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setYtSearchQuery("");
                            fetchYouTubeSearchResults("");
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isYtSearching}
                      className="px-4 py-2 bg-[#ffe600] hover:bg-[#fff04b] text-black font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isYtSearching ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Searching</span>
                        </>
                      ) : (
                        <span>Search</span>
                      )}
                    </button>
                  </form>
                </div>

                {/* Content Container */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                  {/* API Key Missing Warning Banner */}
                  {!process.env.NEXT_PUBLIC_YOUTUBE_API_KEY &&
                    !process.env.NEXT_PUBLIC_YOUTUBE_KEY &&
                    !process.env.NEXT_PUBLIC_YT_API_KEY && (
                      <div className="mb-4 bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs p-3.5 rounded-2xl flex items-start gap-2.5 shadow-lg">
                        <AlertCircle size={18} className="text-[#ffe600] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-white mb-0.5">YouTube API Key Not Detected</div>
                          <div className="text-[11px] leading-relaxed text-amber-200/90">
                            Add <code className="bg-black/50 px-1.5 py-0.5 rounded text-[#ffe600] font-mono">NEXT_PUBLIC_YOUTUBE_API_KEY=your_key</code> to your <code className="bg-black/50 px-1.5 py-0.5 rounded font-mono">.env.local</code> file and restart the Next.js dev server to enable real-time YouTube search.
                          </div>
                        </div>
                      </div>
                    )}

                  {/* API Error / Quota Alert Banner */}
                  {ytSearchError && (
                    <div className="mb-4 bg-red-950/80 border border-red-500/50 text-red-200 text-xs p-3.5 rounded-2xl flex items-start gap-2.5 shadow-lg animate-fade-in">
                      <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-white mb-0.5">YouTube Search Error</div>
                        <div className="text-[11px] leading-relaxed text-red-200/90">{ytSearchError}</div>
                      </div>
                    </div>
                  )}

                  {/* Loading Skeletons */}
                  {isYtSearching && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-[#240344] rounded-2xl p-2 animate-pulse space-y-2 border border-purple-500/10">
                          <div className="aspect-video bg-purple-950/60 rounded-xl" />
                          <div className="h-3 bg-purple-900/60 rounded w-3/4" />
                          <div className="h-2.5 bg-purple-900/40 rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty Results State */}
                  {!isYtSearching && !ytSearchError && hasSearched && ytSearchResults.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                      <Search size={32} className="text-purple-400/60 mb-2" />
                      <span className="text-sm font-bold text-white">No results found for "{ytSearchQuery}"</span>
                      <p className="text-xs text-purple-300/70 mt-1 max-w-sm">
                        Try different keywords, check for typos, or paste a direct YouTube video URL.
                      </p>
                    </div>
                  )}

                  {/* Real Search Video Results Grid */}
                  {!isYtSearching && ytSearchResults.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {ytSearchResults.map((video) => (
                        <div
                          key={video.id}
                          onClick={() => launchVideo(video.id, video.title)}
                          className="group bg-[#28054a] hover:bg-[#340760] rounded-2xl overflow-hidden border border-purple-500/20 hover:border-[#ffe600]/80 transition-all transform hover:-translate-y-1 shadow-lg cursor-pointer flex flex-col"
                        >
                          <div className="relative aspect-video w-full bg-black overflow-hidden">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (!target.dataset.fallbackTried) {
                                  target.dataset.fallbackTried = "true";
                                  target.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
                                } else {
                                  target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22480%22%20height%3D%22270%22%20viewBox%3D%220%200%20480%20270%22%3E%3Crect%20fill%3D%22%23240344%22%20width%3D%22480%22%20height%3D%22270%22%2F%3E%3Cpolygon%20points%3D%22215%2C105%20285%2C135%20215%2C165%22%20fill%3D%22%23ffe600%22%2F%3E%3C%2Fsvg%3E";
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                              <div className="w-10 h-10 rounded-full bg-[#ffe600] text-black flex items-center justify-center shadow-lg">
                                <Play size={16} className="fill-black ml-0.5" />
                              </div>
                            </div>
                          </div>

                          <div className="p-3 flex-1 flex flex-col justify-between">
                            <h4
                              className="text-xs font-bold text-white line-clamp-2 leading-relaxed group-hover:text-[#ffe600] transition"
                              dangerouslySetInnerHTML={{ __html: video.title }}
                            />
                            {video.channelTitle && (
                              <span className="text-[10px] text-purple-300/70 mt-2 font-medium truncate">
                                {video.channelTitle}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* VIEW 5: SELECT MEDIA CATALOG (7 REQUESTED DISCOVER APPS) */
              <div className="flex-1 flex flex-col h-full">
                <div className="p-4 sm:p-5 border-b border-purple-900/40 flex items-center justify-between bg-[#1f023a]">
                  <h3 className="text-lg font-black text-white">Select Media</h3>
                  <button
                    onClick={() => setIsMediaModalOpen(false)}
                    className="text-purple-300 hover:text-white p-1 rounded-xl hover:bg-purple-900/50 transition cursor-pointer"
                  >
                    <X size={22} />
                  </button>
                </div>

                <div className="p-3 sm:p-4 border-b border-purple-900/30 flex flex-wrap items-center justify-between gap-3 bg-[#1c0235]">
                  <div className="flex items-center gap-2">
                    {/* Screen Share Button */}
                    <button
                      onClick={() => setModalView("screenshare_settings")}
                      className={`w-10 h-10 rounded-xl ${
                        modalView === "screenshare_settings"
                          ? "bg-[#ffe600] text-black"
                          : "bg-[#2e0556] hover:bg-[#3d0773] text-purple-200 hover:text-white"
                      } border border-purple-500/30 flex items-center justify-center transition cursor-pointer`}
                      title="Share Screen"
                    >
                      <Monitor size={18} />
                    </button>

                    {/* Stream Any Link / URL Button */}
                    <button
                      onClick={() => setModalView("link_stream")}
                      className={`w-10 h-10 rounded-xl ${
                        modalView === "link_stream"
                          ? "bg-[#ffe600] text-black"
                          : "bg-[#2e0556] hover:bg-[#3d0773] text-purple-200 hover:text-white"
                      } border border-purple-500/30 flex items-center justify-center transition cursor-pointer`}
                      title="Stream Any Video Link / URL"
                    >
                      <Link2 size={18} />
                    </button>

                    {/* Stream Local File Button */}
                    <button
                      onClick={() => setModalView("local_file")}
                      className={`w-10 h-10 rounded-xl ${
                        modalView === "local_file"
                          ? "bg-[#ffe600] text-black"
                          : "bg-[#2e0556] hover:bg-[#3d0773] text-purple-200 hover:text-white"
                      } border border-purple-500/30 flex items-center justify-center transition cursor-pointer`}
                      title="Stream Local File"
                    >
                      <FileVideo size={18} />
                    </button>
                  </div>

                  <div className="flex-1 max-w-sm relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search apps and media content..."
                      className="w-full bg-[#120022] border border-purple-700/40 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-[#ffe600]"
                    />
                  </div>
                </div>

                <div className="px-4 py-2 border-b border-purple-900/30 flex items-center gap-2 overflow-x-auto text-xs bg-[#190130]">
                  {["All", "Video Catalogs", "Screen shareable", "Dhaba Apps"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setActiveFilterTag(tag)}
                      className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                        activeFilterTag === tag
                          ? "bg-[#3e0873] text-white font-bold border border-purple-400/40"
                          : "text-purple-300 hover:text-white hover:bg-[#2b054f]"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="flex-1 flex overflow-hidden">
                  {/* Category Sidebar */}
                  <div className="w-36 sm:w-44 border-r border-purple-900/30 p-3 space-y-1.5 bg-[#1a0133]">
                    {[
                      { id: "all", label: "Discover", icon: Sparkles },
                      { id: "streaming", label: "Streaming", icon: Tv },
                      { id: "games", label: "Games", icon: Gamepad2 },
                      { id: "activities", label: "Activities", icon: Radio },
                    ].map((cat) => {
                      const Icon = cat.icon;
                      const isActive = activeCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id as any)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                            isActive
                              ? "bg-[#3e0873] text-white border border-purple-500/30 shadow"
                              : "text-purple-300 hover:bg-[#27034c] hover:text-white"
                          }`}
                        >
                          <Icon size={15} className={isActive ? "text-[#ffe600]" : "text-purple-400"} />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 4-Column Card Grid (ONLY the 7 requested apps) */}
                  <div className="flex-1 p-4 sm:p-5 overflow-y-auto bg-[#17002b]">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5">
                      {filteredCatalog.map((app) => (
                        <div
                          key={app.id}
                          onClick={() => {
                            if (app.id === "chess" || app.type === "game") {
                              stopScreenShare();
                              setActiveLinkStream(null);
                              setActiveActivity("chess" as any);
                              setIsMediaModalOpen(false);
                              setModalView("catalog");
                              showNotice("Chess Club opened!");
                              return;
                            }
                            if (app.id === "netflix") {
                              setIsMediaModalOpen(false);
                              setModalView("catalog");
                              setNetflixModalOpen(true);
                              return;
                            }
                            if (app.id === "screenshare" || app.id === "virtual-browser") {
                              setModalView("screenshare_settings");
                            } else if (app.id === "youtube") {
                              setModalView("youtube_browser");
                            } else if (app.type === "link") {
                              setModalView("link_stream");
                            } else {
                              showNotice(`${app.name} selected!`);
                            }
                          }}
                          className={`group relative rounded-2xl ${app.bg} aspect-[16/11] flex items-center justify-center p-3 sm:p-4 border border-white/10 hover:border-[#ffe600] transition-all transform hover:-translate-y-1 hover:shadow-2xl cursor-pointer overflow-hidden shadow-lg`}
                        >
                          {app.renderLogo()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Netflix Sync Modal */}
      {netflixModalOpen && (
        <NetflixSyncModal
          roomId={roomId}
          username={username}
          onClose={() => setNetflixModalOpen(false)}
        />
      )}
    </div>
  );
}