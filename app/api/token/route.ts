import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room");
  const username =
    req.nextUrl.searchParams.get("username") ||
    `Friend_${Math.floor(Math.random() * 1000)}`;

  if (!room) {
    return NextResponse.json(
      { error: 'Missing "room" parameter' },
      { status: 400 }
    );
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json(
      {
        error:
          "LiveKit is not configured. Add valid LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and NEXT_PUBLIC_LIVEKIT_URL (wss://...) from your LiveKit project to .env.local, then restart the dev server.",
      },
      { status: 500 }
    );
  }

  if (apiKey === "devkey" || apiSecret === "secret") {
    return NextResponse.json(
      {
        error:
          "Placeholder LiveKit credentials detected. Replace LIVEKIT_API_KEY/LIVEKIT_API_SECRET with real keys from your LiveKit Cloud/self-hosted project (and set NEXT_PUBLIC_LIVEKIT_URL to that project's wss URL).",
      },
      { status: 500 }
    );
  }

  // Create an access pass for this user in this room
  const at = new AccessToken(apiKey, apiSecret, {
    identity: username,
    name: username,
  });

  at.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();

  return NextResponse.json({ token, wsUrl });
}