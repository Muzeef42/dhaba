import { create } from "zustand";
import { StageActivity } from "@/types/room";

interface RoomStore {
  isChatOpen: boolean;
  toggleChat: () => void;
  activeActivity: StageActivity;
  setActiveActivity: (activity: StageActivity) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  isChatOpen: true,
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  activeActivity: "grid",
  setActiveActivity: (activity) => set({ activeActivity: activity }),
}));