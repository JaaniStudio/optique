import { create } from "zustand";

type UIState = {
  cartCount: number;
  favoritesCount: number;
  setCartCount: (n: number) => void;
  setFavoritesCount: (n: number) => void;
};

export const useUIStore = create<UIState>((set) => ({
  cartCount: 0,
  favoritesCount: 0,
  setCartCount: (n) => set({ cartCount: n }),
  setFavoritesCount: (n) => set({ favoritesCount: n }),
}));
