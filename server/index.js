const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://localhost:3000", "*"],
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 4000;

// In-memory room state
const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      videoId: null,
      videoTitle: null,
      isPlaying: false,
      currentTime: 0,
      participants: new Map(),
      lastSync: null,
    });
  }
  return rooms.get(roomId);
}

function broadcastToRoom(roomId, event, data, excludeSocketId = null) {
  const room = getRoom(roomId);
  if (!room) return;
  io.to(roomId).except(excludeSocketId).emit(event, data);
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);
    const room = getRoom(roomId);

    const participant = {
      id: socket.id,
      username: username || `Guest_${Math.floor(Math.random() * 1000)}`,
      joinedAt: Date.now(),
      isWatching: false,
      videoId: null,
    };
    room.participants.set(socket.id, participant);

    // Send current room state to the joiner
    socket.emit("room-state", {
      roomId: room.id,
      videoId: room.videoId,
      videoTitle: room.videoTitle,
      isPlaying: room.isPlaying,
      currentTime: room.currentTime,
      participants: Array.from(room.participants.values()).map((p) => ({
        id: p.id,
        username: p.username,
        isWatching: p.isWatching,
        videoId: p.videoId,
      })),
      serverTime: Date.now(),
    });

    // Notify others
    socket.to(roomId).emit("participant-joined", participant);

    console.log(`${participant.username} joined room ${roomId}`);
  });

  socket.on("sync-video", ({ roomId, videoId, videoTitle, isPlaying, currentTime }) => {
    const room = getRoom(roomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    if (participant) {
      participant.videoId = videoId;
      participant.videoTitle = videoTitle;
      participant.isWatching = true;
    }

    room.videoId = videoId;
    room.videoTitle = videoTitle;
    room.isPlaying = isPlaying;
    room.currentTime = currentTime;
    room.lastSync = Date.now();

    // Broadcast to everyone else (exclude sender to avoid loops)
    socket.to(roomId).emit("video-synced", {
      videoId,
      videoTitle,
      isPlaying,
      currentTime,
      senderId: socket.id,
      timestamp: Date.now(),
      serverTime: Date.now(),
    });

    // Notify participant updated
    io.to(roomId).emit("participant-updated", {
      id: socket.id,
      videoId,
      isWatching: true,
    });

    console.log(`Video synced in room ${roomId}: ${videoId} (${isPlaying ? "playing" : "paused"}) at ${currentTime}s`);
  });

  socket.on("sync-play", ({ roomId, currentTime, videoId }) => {
    const room = getRoom(roomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    if (participant) {
      participant.isWatching = true;
      participant.videoId = videoId || room.videoId;
    }

    room.isPlaying = true;
    room.currentTime = currentTime;
    room.lastSync = Date.now();

    socket.to(roomId).emit("video-play", {
      currentTime,
      videoId: videoId || room.videoId,
      senderId: socket.id,
      timestamp: Date.now(),
      serverTime: Date.now(),
    });

    io.to(roomId).emit("participant-updated", {
      id: socket.id,
      isWatching: true,
      videoId: videoId || room.videoId,
    });
  });

  socket.on("sync-pause", ({ roomId, currentTime, videoId }) => {
    const room = getRoom(roomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    if (participant) {
      participant.isWatching = true;
      participant.videoId = videoId || room.videoId;
    }

    room.isPlaying = false;
    room.currentTime = currentTime;
    room.lastSync = Date.now();

    socket.to(roomId).emit("video-pause", {
      currentTime,
      videoId: videoId || room.videoId,
      senderId: socket.id,
      timestamp: Date.now(),
      serverTime: Date.now(),
    });

    io.to(roomId).emit("participant-updated", {
      id: socket.id,
      isWatching: true,
      videoId: videoId || room.videoId,
    });
  });

  socket.on("sync-seek", ({ roomId, currentTime, videoId }) => {
    const room = getRoom(roomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    if (participant) {
      participant.isWatching = true;
      participant.videoId = videoId || room.videoId;
    }

    room.currentTime = currentTime;
    room.lastSync = Date.now();

    socket.to(roomId).emit("video-seek", {
      currentTime,
      videoId: videoId || room.videoId,
      senderId: socket.id,
      timestamp: Date.now(),
      serverTime: Date.now(),
    });
  });

  socket.on("leave-room", ({ roomId }) => {
    socket.leave(roomId);
    const room = getRoom(roomId);
    if (room) {
      room.participants.delete(socket.id);
      socket.to(roomId).emit("participant-left", socket.id);
    }
  });

  socket.on("disconnect", () => {
    rooms.forEach((room, roomId) => {
      if (room.participants.has(socket.id)) {
        room.participants.delete(socket.id);
        io.to(roomId).emit("participant-left", socket.id);
        socket.to(roomId).emit("participant-disconnected", socket.id);
      }
    });
    console.log("Client disconnected:", socket.id);
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", rooms: rooms.size });
});

app.get("/rooms/:roomId", (req, res) => {
  const room = getRoom(req.params.roomId);
  res.json({
    roomId: room.id,
    videoId: room.videoId,
    videoTitle: room.videoTitle,
    isPlaying: room.isPlaying,
    currentTime: room.currentTime,
    participantCount: room.participants.size,
    participants: Array.from(room.participants.values()).map((p) => ({
      id: p.id,
      username: p.username,
      isWatching: p.isWatching,
      videoId: p.videoId,
    })),
  });
});

server.listen(PORT, () => {
  console.log(`Netflix sync server running on port ${PORT}`);
});
