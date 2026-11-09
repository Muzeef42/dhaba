# 🪐 Dhaba — Virtual Hangout & Watch Party Platform

Dhaba is a modern real-time virtual space for friends to hangout, stream videos together, share screens, and chat with crystal-clear audio and video feeds — inspired by Kosmi.io.

---

## ✨ Features

- 📹 **Low-Latency Video & Audio**: WebRTC media feeds powered by LiveKit SFU.
- 📺 **Synchronized Watch Party**: Built-in YouTube player on the central stage for watching together.
- 💬 **Dual-Layer Chat System**:
  - In-flight ultra-low latency real-time messaging via WebRTC Data Channels.
  - Persistent chat history backed by **MongoDB**.
- 🖥️ **Screen Sharing**: One-click display streaming for presentations and games.
- 🎨 **Kosmi-Inspired UI**: Custom dark violet/neon yellow aesthetic with floating dock controls.
- 🚀 **Zero Sign-Up Required**: Instant guest access with customizable nicknames and random room codes.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide Icons
- **WebRTC & Media**: LiveKit Client & LiveKit Server SDK
- **Database**: MongoDB & Mongoose
- **State Management**: Zustand

---

## 🚀 Getting Started

1. **Clone the repo**:
   \`\`\`bash
   git clone https://github.com/YOUR_USERNAME/dhaba.git
   cd dhaba
   \`\`\`

2. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Environment Variables**:
   Create a \`.env.local\` file:
   \`\`\`env
   LIVEKIT_API_KEY=your_key
   LIVEKIT_API_SECRET=your_secret
   NEXT_PUBLIC_LIVEKIT_URL=your_ws_url
   MONGODB_URI=your_mongodb_uri
   \`\`\`

4. **Run development server**:
   \`\`\`bash
   npm run dev
   \`\`\`
   Visit [http://localhost:3000](http://localhost:3000)

---

## 🍿 Netflix Watch Party (New Feature)

Dhaba now includes a Netflix sync feature that lets you watch Netflix together with friends in the same room, with synchronized play/pause/seek across all clients.

### Architecture

- **Socket.IO server** (`/server`) — Broadcasts playback events ({type, currentTime, timestamp, videoId}) to everyone in a room, with latency compensation.
- **Chrome/Brave Extension** (`/extension`) — Manifest V3 content script that runs on `netflix.com/watch/*`, finds the `<video>` element, and syncs playback via WebSocket.
- **Next.js UI** — Modal with 2-step flow ("Launch" → "Share"), participant list, connection status, and "Join the same title" button.

### Step 1: Run the Sync Server

```bash
cd server
npm install
npm start
```

The server runs on `http://localhost:4000` by default. Set `PORT` env var to change it.

### Step 2: Load the Chrome Extension

1. Open Chrome or Brave and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked** and select the `/extension` folder in this repo
4. The "Dhaba Netflix Sync" extension will appear in your toolbar

### Step 3: Use Netflix Sync in Dhaba

1. Start the Next.js dev server: `npm run dev`
2. Open a room at `http://localhost:3000/room/your-room`
3. Click the **Netflix** button (red icon) in the room header
4. **Step 1 — Launch**: Click "Launch Netflix" to open `netflix.com` in a new tab. Log in with your own Netflix account (Dhaba never collects or stores credentials).
5. **Step 2 — Share**: The modal shows your room code. Share it with friends. Once they join the same room, they can click **"Join the same title on Netflix"** to open the same video.
6. Play/pause/seek on Netflix in one browser, and it syncs to everyone else in the room (with latency compensation).

### Step 4: Test with Two Browser Profiles

To verify sync works end-to-end:

1. **Profile A**: Open Chrome normally, load the Dhaba room, click Netflix → Launch, open Netflix in a new tab, play a video.
2. **Profile B**: Open a second Chrome profile (or Brave), load the same Dhaba room code, click Netflix → Share → "Join the same title on Netflix".
3. In Profile A, pause/seek the video. Profile B's Netflix should pause/seek to the same time within ~100ms.

### Notes

- Each user must have their own Netflix subscription and log in separately. Dhaba does not handle Netflix authentication.
- The extension only runs on `https://www.netflix.com/watch/*`.
- The Socket.IO server must be running (`localhost:4000`) for sync to work. Connection status is shown in the Netflix modal and room header.
- Video ID is extracted from the Netflix URL path (`/watch/<id>`) so everyone opens the same title.

