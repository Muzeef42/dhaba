/**
 * Dhaba Netflix Sync - Content Script
 * Runs on netflix.com/watch/*
 * Syncs Netflix playback state with Dhaba room via Socket.IO
 */

(function () {
  "use strict";

  const SERVER_URL = "http://localhost:4000";
  const ROOM_ID = "dhaba-netflix-room"; // Default room; can be overridden via storage

  let socket = null;
  let video = null;
  let isProcessingOwnEvent = false;
  let lastSentTime = 0;
  let roomId = ROOM_ID;
  let username = "Netflix User";

  // Throttle: don't send more than one seek event per 300ms
  const SEEK_THROTTLE_MS = 300;

  function log(msg) {
    console.log(`[Dhaba Netflix Sync] ${msg}`);
  }

  function init() {
    // Load room id and username from storage
    chrome.storage.local.get(["roomId", "username"], (result) => {
      if (result.roomId) roomId = result.roomId;
      if (result.username) username = result.username;
      connectSocket();
    });
  }

  function connectSocket() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }

    socket = io(SERVER_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      log("Connected to sync server");
      socket.emit("join-room", { roomId, username });
    });

    socket.on("disconnect", () => {
      log("Disconnected from sync server");
    });

    socket.on("room-state", (state) => {
      log("Received room state:", state);
      roomId = state.roomId;
      // Don't auto-apply state; let the user choose to join
    });

    socket.on("video-synced", (data) => {
      if (data.senderId === socket.id) return; // ignore own events
      applyRemoteEvent(data);
    });

    socket.on("video-play", (data) => {
      if (data.senderId === socket.id) return;
      applyRemotePlay(data);
    });

    socket.on("video-pause", (data) => {
      if (data.senderId === socket.id) return;
      applyRemotePause(data);
    });

    socket.on("video-seek", (data) => {
      if (data.senderId === socket.id) return;
      applyRemoteSeek(data);
    });

    socket.on("participant-joined", (p) => {
      log("Participant joined:", p.username);
    });

    socket.on("participant-left", (id) => {
      log("Participant left:", id);
    });

    socket.on("participant-updated", (p) => {
      log("Participant updated:", p.id);
    });

    socket.on("connect_error", (err) => {
      log("Connection error:", err.message);
    });
  }

  function findVideo() {
    const v = document.querySelector("video");
    if (v && v !== video) {
      video = v;
      setupVideoListeners(video);
      log("Video element found and listeners attached");
    }
    return video;
  }

  function setupVideoListeners(v) {
    // Remove old listeners if re-attaching
    v.removeEventListener("play", handlePlay);
    v.removeEventListener("pause", handlePause);
    v.removeEventListener("seeked", handleSeeked);

    v.addEventListener("play", handlePlay);
    v.addEventListener("pause", handlePause);
    v.addEventListener("seeked", handleSeeked);
  }

  function handlePlay() {
    if (isProcessingOwnEvent) return;
    const now = Date.now();
    if (now - lastSentTime < 100) return; // debounce
    lastSentTime = now;

    const currentTime = video ? video.currentTime : 0;
    log(`Play event at ${currentTime}s`);

    if (socket && socket.connected) {
      socket.emit("sync-play", { roomId, currentTime, videoId: extractVideoId() });
    }
  }

  function handlePause() {
    if (isProcessingOwnEvent) return;
    const now = Date.now();
    if (now - lastSentTime < 100) return;
    lastSentTime = now;

    const currentTime = video ? video.currentTime : 0;
    log(`Pause event at ${currentTime}s`);

    if (socket && socket.connected) {
      socket.emit("sync-pause", { roomId, currentTime, videoId: extractVideoId() });
    }
  }

  function handleSeeked() {
    if (isProcessingOwnEvent) return;
    const now = Date.now();
    if (now - lastSentTime < SEEK_THROTTLE_MS) return;
    lastSentTime = now;

    const currentTime = video ? video.currentTime : 0;
    log(`Seek event at ${currentTime}s`);

    if (socket && socket.connected) {
      socket.emit("sync-seek", { roomId, currentTime, videoId: extractVideoId() });
    }
  }

  function extractVideoId() {
    // Netflix URL: https://www.netflix.com/watch/<id>
    const match = window.location.pathname.match(/\/watch\/(\d+)/);
    return match ? match[1] : null;
  }

  function applyRemoteEvent(data) {
    if (!video) {
      findVideo();
      if (!video) return;
    }

    isProcessingOwnEvent = true;

    try {
      if (data.videoId && data.videoId !== extractVideoId()) {
        // Different title; notify user to open the same title
        showRemoteTitleNotification(data.videoId);
        return;
      }

      const targetTime = data.currentTime;
      const now = performance.now();
      const latencyMs = now - (data.timestamp || now);

      // Compensate for latency: add half the round-trip time
      const adjustedTime = targetTime + latencyMs / 2;

      if (Math.abs(video.currentTime - adjustedTime) > 1) {
        video.currentTime = adjustedTime;
        log(`Seeked remotely to ${adjustedTime.toFixed(2)}s (latency-compensated)`);
      }

      if (data.isPlaying && video.paused) {
        video.play();
        log("Remote play applied");
      } else if (!data.isPlaying && !video.paused) {
        video.pause();
        log("Remote pause applied");
      }
    } finally {
      isProcessingOwnEvent = false;
    }
  }

  function applyRemotePlay(data) {
    if (!video) {
      findVideo();
      if (!video) return;
    }
    isProcessingOwnEvent = true;
    try {
      if (data.videoId && data.videoId !== extractVideoId()) {
        showRemoteTitleNotification(data.videoId);
        return;
      }
      if (video.paused) {
        video.play();
        log("Remote play applied");
      }
    } finally {
      isProcessingOwnEvent = false;
    }
  }

  function applyRemotePause(data) {
    if (!video) {
      findVideo();
      if (!video) return;
    }
    isProcessingOwnEvent = true;
    try {
      if (data.videoId && data.videoId !== extractVideoId()) {
        showRemoteTitleNotification(data.videoId);
        return;
      }
      if (!video.paused) {
        video.pause();
        log("Remote pause applied");
      }
    } finally {
      isProcessingOwnEvent = false;
    }
  }

  function applyRemoteSeek(data) {
    if (!video) {
      findVideo();
      if (!video) return;
    }
    isProcessingOwnEvent = true;
    try {
      if (data.videoId && data.videoId !== extractVideoId()) {
        showRemoteTitleNotification(data.videoId);
        return;
      }
      const targetTime = data.currentTime;
      const now = performance.now();
      const latencyMs = now - (data.timestamp || now);
      const adjustedTime = targetTime + latencyMs / 2;
      if (Math.abs(video.currentTime - adjustedTime) > 1) {
        video.currentTime = adjustedTime;
        log(`Remote seek to ${adjustedTime.toFixed(2)}s`);
      }
    } finally {
      isProcessingOwnEvent = false;
    }
  }

  function showRemoteTitleNotification(videoId) {
    // Remove existing notification
    const existing = document.getElementById("dhaba-netflix-notice");
    if (existing) existing.remove();

    const notice = document.createElement("div");
    notice.id = "dhaba-netflix-notice";
    notice.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 999999;
      background: #ff4d4d;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      max-width: 400px;
      text-align: center;
    `;
    notice.innerHTML = `
      <strong>Someone is watching a different Netflix title</strong><br>
      Open <code>https://www.netflix.com/watch/${videoId}</code> to sync.
    `;
    document.body.appendChild(notice);

    setTimeout(() => notice.remove(), 5000);
  }

  // Poll for video element (Netflix is a SPA)
  const pollInterval = setInterval(() => {
    findVideo();
  }, 2000);

  // Also watch for URL changes (Netflix navigates without reload)
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      const newId = extractVideoId();
      if (newId && socket && socket.connected) {
        socket.emit("sync-video", {
          roomId,
          videoId: newId,
          videoTitle: document.title,
          isPlaying: video && !video.paused,
          currentTime: video ? video.currentTime : 0,
        });
      }
    }
  }).observe(document, { subtree: true, childList: true });

  // Initialize
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose for debugging
  window.__dhabaNetflixSync = { connectSocket, findVideo, roomId: () => roomId };

})();

// Socket.IO client (loaded via CDN in the page)
// We inject the socket.io client script dynamically
(function injectSocketIO() {
  const script = document.createElement("script");
  script.src = "https://cdn.socket.io/4.7.5/socket.io.min.js";
  script.onload = () => {
    // Socket.IO global `io` is now available; the IIFE above uses it
  };
  document.head.appendChild(script);
})();
