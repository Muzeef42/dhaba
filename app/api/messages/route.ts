import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/models/Message";

// GET /api/messages?room=... -> Fetch chat history for this room
export async function GET(req: NextRequest) {
  try {
    const room = req.nextUrl.searchParams.get("room");
    if (!room) {
      return NextResponse.json({ error: "Missing room parameter" }, { status: 400 });
    }

    await connectToDatabase();
    const messages = await Message.find({ roomId: room })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json({ messages: [] }); // Fallback gracefully if DB is offline
  }
}

// POST /api/messages -> Save a new chat message to MongoDB
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, senderName, senderId, message } = body;

    if (!roomId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const newMessage = await Message.create({
      roomId,
      senderName,
      senderId,
      message,
    });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Failed to save message to MongoDB:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}