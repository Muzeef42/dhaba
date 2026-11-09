import { create } from "zustand";
import { StageActivity } from "@/types/room";

interface RoomStore {
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  toggleChat: () => void;
  activeActivity: StageActivity;
  setActiveActivity: (activity: StageActivity) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  isChatOpen: true,
  setChatOpen: (open) => set({ isChatOpen: open }),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  activeActivity: "grid",
  setActiveActivity: (activity) => set({ activeActivity: activity }),
}));