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
