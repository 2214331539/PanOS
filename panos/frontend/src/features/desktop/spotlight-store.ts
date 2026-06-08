import { create } from "zustand";

interface SpotlightStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useSpotlightStore = create<SpotlightStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

