export type StageActivity = "grid" | "screenshare" | "youtube" | "drawing";

export interface ParticipantInfo {
  identity: string;
  name: string;
  avatarUrl?: string;
  isSpeaking?: boolean;
  isMuted?: boolean;
  isCameraOff?: boolean;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderId: string;
  message: string;
  timestamp: number;
}

export interface RoomState {
  roomId: string;
  activeActivity: StageActivity;
  participants: ParticipantInfo[];
  messages: ChatMessage[];
}